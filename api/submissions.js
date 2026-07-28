const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const AIRTABLE_BASE  = process.env.AIRTABLE_BASE;
const AIRTABLE_TABLE = process.env.AIRTABLE_TABLE || 'Submissions';
const AT_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE}/${encodeURIComponent(AIRTABLE_TABLE)}`;
const atHeaders = { 'Authorization': `Bearer ${AIRTABLE_TOKEN}`, 'Content-Type': 'application/json' };

function fromAirtable(record) {
  const f = record.fields;
  let acrl = {};
  try { acrl = JSON.parse(f.acrl_detail || '{}'); } catch(e) {}
  let frl_supports = [];
  try { frl_supports = JSON.parse(f.frl_supports || '[]'); } catch(e) {}
  return {
    id: record.id,
    orgname: f.orgname || '', progname: f.progname || '', province: f.province || '', provinces: f.provinces ? f.provinces.split(' | ') : (f.province ? [f.province] : []),
    role: f.role || '', orgtype: f.orgtype || '',
    affiliations: f.affiliations ? f.affiliations.split(' | ') : [],
    funding: f.funding ? f.funding.split(' | ') : [],
    intake: f.intake || '', structure: f.structure || '', duration: f.duration || '',
    offerings: f.offerings ? f.offerings.split(' | ') : [],
    sectors: f.sectors ? f.sectors.split(' | ') : [],
    trl_min: f.trl_min || '', trl_exit: f.trl_exit || '',
    acrl, frl_supports,
    selection: f.selection || '', missing: f.missing || '', kpis: f.kpis || '',
    ts: f.submitted_at || ''
  };
}

function toAirtable(sub) {
  return {
    orgname: sub.orgname || '', progname: sub.progname || '', province: (sub.provinces&&sub.provinces.length>0)?sub.provinces[0]:(sub.province||''), provinces: (sub.provinces||[sub.province].filter(Boolean)).join(' | '),
    role: sub.role || '', orgtype: sub.orgtype || '',
    affiliations: (sub.affiliations || []).join(' | '),
    funding: (sub.funding || []).join(' | '),
    intake: sub.intake || '', structure: sub.structure || '',
    duration: String(sub.duration || ''),
    offerings: (sub.offerings || []).join(' | '),
    sectors: (sub.sectors || []).join(' | '),
    trl_min: String(sub.trl_min || (sub.acrl&&sub.acrl.trl?sub.acrl.trl.entry:'')),
    trl_exit: String(sub.trl_exit || (sub.acrl&&sub.acrl.trl?sub.acrl.trl.exit:'')),
    acrl_dims: Object.keys(sub.acrl || {}).join(', '),
    acrl_detail: JSON.stringify(sub.acrl || {}),
    frl_supports: JSON.stringify(sub.frl_supports || []),
    selection: sub.selection || '', missing: sub.missing || '', kpis: sub.kpis || '',
    submitted_at: sub.ts || new Date().toISOString()
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      let allRecords = [], offset = null;
      do {
        const url = offset ? `${AT_URL}?pageSize=100&offset=${offset}` : `${AT_URL}?pageSize=100`;
        const r = await fetch(url, { headers: atHeaders });
        if (!r.ok) { const err = await r.text(); return res.status(500).json({ error: 'Airtable fetch failed', detail: err }); }
        const data = await r.json();
        allRecords = allRecords.concat(data.records || []);
        offset = data.offset || null;
      } while (offset);
      const submissions = allRecords.map(fromAirtable);
      submissions.sort((a, b) => new Date(a.ts) - new Date(b.ts));
      return res.status(200).json(submissions);
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'POST') {
    try {
      const sub = req.body;
      sub.ts = new Date().toISOString();
      const r = await fetch(AT_URL, { method: 'POST', headers: atHeaders, body: JSON.stringify({ fields: toAirtable(sub) }) });
      if (!r.ok) { const err = await r.text(); return res.status(500).json({ error: 'Airtable create failed', detail: err }); }
      const data = await r.json();
      return res.status(201).json({ ok: true, id: data.id });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  if (req.method === 'DELETE') {
    try {
      const id = req.query.id;
      const r = await fetch(`${AT_URL}/${id}`, { method: 'DELETE', headers: atHeaders });
      if (!r.ok) { const err = await r.text(); return res.status(500).json({ error: 'Airtable delete failed', detail: err }); }
      return res.status(200).json({ ok: true });
    } catch(e) { return res.status(500).json({ error: e.message }); }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
