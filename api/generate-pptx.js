// Vercel serverless function — /api/generate-pptx
// POST body: submission object
// Returns: .pptx file as binary download

import PptxGenJS from 'pptxgenjs';

const DIMS = [
  { id: 'trl',    label: 'Technology Readiness (TRL)',    short: 'TRL',      color: '97C459' },
  { id: 'frl',    label: 'Funding Readiness (FRL)',       short: 'Funding',  color: 'FAC775' },
  { id: 'brl',    label: 'Business Readiness (BRL)',      short: 'Business', color: '5DCAA5' },
  { id: 'iprl',   label: 'IP Readiness (IP-RL)',          short: 'IP',       color: 'AFA9EC' },
  { id: 'mrl',    label: 'Manufacturing Readiness (MRL)', short: 'Mfg',      color: '85B7EB' },
  { id: 'teamrl', label: 'Team Readiness (TEAM-RL)',      short: 'Team',     color: 'F0997B' },
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const s = req.body;
  if (!s || !s.orgname) return res.status(400).json({ error: 'Missing submission data' });

  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_16x9';

  // ─── SLIDE 1: Cover ───────────────────────────────────────────────────────
  const cover = pres.addSlide();
  cover.background = { color: '1E2761' };

  // Diagonal accent shape top-right
  cover.addShape(pres.shapes.RECTANGLE, {
    x: 7.5, y: 0, w: 2.5, h: 5.625,
    fill: { color: '534AB7', transparency: 60 },
    line: { color: '534AB7', transparency: 60 }
  });

  // L2M badge top-left
  cover.addText('L2M', {
    x: 0.5, y: 0.35, w: 1.4, h: 0.42,
    fontSize: 13, fontFace: 'Calibri', bold: true,
    color: 'FFFFFF', align: 'center', valign: 'middle',
    fill: { color: '534AB7' }, margin: 0
  });

  // Workshop label
  cover.addText('Atlantic Ecosystem Mapping — June 4, 2026', {
    x: 0.5, y: 0.9, w: 7.0, h: 0.3,
    fontSize: 11, fontFace: 'Calibri', color: 'CADCFC',
    align: 'left', valign: 'middle', margin: 0
  });

  // Program name — big (primary)
  cover.addText(s.progname || s.orgname, {
    x: 0.5, y: 1.4, w: 6.8, h: 1.6,
    fontSize: (s.progname||s.orgname).length > 25 ? 30 : 38,
    fontFace: 'Calibri', bold: true,
    color: 'FFFFFF', align: 'left', valign: 'middle', margin: 0
  });
  // Org name — secondary below
  if (s.progname) {
    cover.addText(s.orgname, {
      x: 0.5, y: 3.05, w: 6.8, h: 0.4,
      fontSize: 14, fontFace: 'Calibri', italic: true,
      color: 'CADCFC', align: 'left', valign: 'middle', margin: 0
    });
  }

  // Province tag
  cover.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 3.7, w: 1.1, h: 0.32,
    fill: { color: '28337A' }, line: { color: '7F77DD', width: 1 }, rectRadius: 0.05
  });
  cover.addText(s.province || '—', {
    x: 0.5, y: 3.7, w: 1.1, h: 0.32,
    fontSize: 10, fontFace: 'Calibri', bold: true, color: 'CADCFC',
    align: 'center', valign: 'middle', margin: 0
  });

  // Org type
  cover.addText((s.orgtype || '').split('(')[0].trim(), {
    x: 1.75, y: 3.7, w: 5.5, h: 0.32,
    fontSize: 11, fontFace: 'Calibri', color: 'CADCFC',
    align: 'left', valign: 'middle', margin: 0
  });

  // Bottom rule
  cover.addShape(pres.shapes.RECTANGLE, {
    x: 0.5, y: 4.2, w: 6.8, h: 0.03,
    fill: { color: '534AB7' }, line: { color: '534AB7' }
  });

  cover.addText(`${s.role || ''} · ${s.website || ''}`, {
    x: 0.5, y: 4.35, w: 7.0, h: 0.3,
    fontSize: 9, fontFace: 'Calibri', color: '8899CC',
    align: 'left', valign: 'middle', margin: 0
  });

  // ─── SLIDE 2: Summary ─────────────────────────────────────────────────────
  const sum = pres.addSlide();
  sum.background = { color: 'FFFFFF' };

  // Top bar
  sum.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 10, h: 0.55,
    fill: { color: '1E2761' }, line: { color: '1E2761' }
  });
  sum.addText('Organization Profile Summary', {
    x: 0.4, y: 0, w: 7, h: 0.55,
    fontSize: 13, fontFace: 'Calibri', bold: true, color: 'FFFFFF',
    align: 'left', valign: 'middle', margin: 0
  });
  sum.addText(s.orgname, {
    x: 7, y: 0, w: 2.7, h: 0.55,
    fontSize: 10, fontFace: 'Calibri', color: 'CADCFC',
    align: 'right', valign: 'middle', margin: 0
  });

  // Helper: draw a labeled info block
  function addBlock(slide, x, y, w, h, label, value, accentColor) {
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w, h,
      fill: { color: 'F7F8FC' },
      line: { color: 'E5E7EB', width: 0.5 },
      shadow: { type: 'outer', color: '000000', blur: 4, offset: 1, angle: 135, opacity: 0.06 }
    });
    slide.addShape(pres.shapes.RECTANGLE, {
      x, y, w: 0.07, h,
      fill: { color: accentColor || '534AB7' },
      line: { color: accentColor || '534AB7' }
    });
    slide.addText(label, {
      x: x + 0.15, y: y + 0.06, w: w - 0.2, h: 0.2,
      fontSize: 8, fontFace: 'Calibri', bold: true, color: '6B7280',
      align: 'left', valign: 'top', margin: 0
    });
    slide.addText(value || '—', {
      x: x + 0.15, y: y + 0.27, w: w - 0.2, h: h - 0.32,
      fontSize: 10, fontFace: 'Calibri', color: '111827',
      align: 'left', valign: 'top', margin: 0, wrap: true
    });
  }

  const col1x = 0.3, col2x = 5.2;
  const bw = 4.6, gap = 0.18;
  let y = 0.65;

  addBlock(sum, col1x, y, bw, 0.65, 'ORGANIZATION TYPE', (s.orgtype || '').split('(')[0].trim(), '534AB7');
  addBlock(sum, col2x, y, bw, 0.65, 'INTAKE & STRUCTURE',
    `${s.intake || '—'} · ${s.structure || '—'}${s.duration ? ' (' + s.duration + ' mo)' : ''}`, '534AB7');
  y += 0.65 + gap;

  addBlock(sum, col1x, y, bw, 0.65, 'TARGET STAGES', (s.stages || []).join(', ') || '—', '1D9E75');
  addBlock(sum, col2x, y, bw, 0.65, 'SECTOR VERTICALS', (s.sectors || []).slice(0, 4).join(', ') || '—', '1D9E75');
  y += 0.65 + gap;

  const acrlDims = Object.keys(s.acrl || {});
  const acrlDetail = acrlDims.length > 0
    ? acrlDims.map(id => {
        const dim = DIMS.find(d => d.id === id);
        const v = s.acrl[id];
        return `${dim ? dim.short : id}: Lvl ${v.entry || '?'} → ${v.exit || '?'}`;
      }).join('  |  ')
    : '—';

  addBlock(sum, col1x, y, bw, 0.65, 'TRL CONTINUUM',
    s.trl_min ? `Entry TRL ${s.trl_min}  →  Exit TRL ${s.trl_exit || '?'}` : '—', 'FAC775');
  addBlock(sum, col2x, y, bw, 0.65, 'ACRL DIMENSIONS', acrlDetail, 'AFA9EC');
  y += 0.65 + gap;

  const offerings = (s.offerings || []).map(o => o.split(':')[0].trim()).slice(0, 5).join(', ');
  addBlock(sum, col1x, y, bw, 0.65, 'PROGRAM OFFERINGS', offerings || '—', '85B7EB');
  addBlock(sum, col2x, y, bw, 0.65, 'FUNDING SOURCES',
    (s.funding || []).map(f => f.split('(')[0].trim()).slice(0, 3).join(', ') || '—', 'F0997B');
  y += 0.65 + gap;

  if (s.kpis) {
    addBlock(sum, col1x, y, 9.4, 0.6, 'KEY PERFORMANCE INDICATORS (KPIs)',
      s.kpis.substring(0, 180), '5DCAA5');
    y += 0.6 + gap;
  }

  if (s.missing) {
    addBlock(sum, col1x, y, 9.4, 0.55, 'FRAMEWORK GAPS / ADDITIONAL DIMENSIONS',
      s.missing.substring(0, 160), 'D85A30');
  }

  // Footer
  sum.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 5.3, w: 10, h: 0.32,
    fill: { color: 'F3F4F6' }, line: { color: 'E5E7EB', width: 0.5 }
  });
  sum.addText(`L2M Atlantic Ecosystem Mapping · June 4, 2026 · ${s.province || ''} · ${s.orgtype ? s.orgtype.split('(')[0].trim() : ''}`, {
    x: 0.3, y: 5.3, w: 9.4, h: 0.32,
    fontSize: 8, fontFace: 'Calibri', color: '9CA3AF',
    align: 'left', valign: 'middle', margin: 0
  });

  // Write to buffer and send
  const pptxBuffer = await pres.write({ outputType: 'nodebuffer' });
  const filename = `${(s.orgname || 'org').replace(/[^a-z0-9]/gi, '_')}_L2M_summary.pptx`;

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.status(200).send(pptxBuffer);
}
