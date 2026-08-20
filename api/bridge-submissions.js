// api/bridge-submissions.js
// GET  -> lists all submissions (used by the admin portal)
// POST -> creates a new submission, or updates one if { recordId } is provided

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Submissions";
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;

const AIRTABLE_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

function toAirtableFields(body) {
  const { team = {}, scores = {}, evidence = {}, bottleneck, bottleneckLevel, aiRec = {}, canvas = {}, status } = body;
  return {
    Venture: team.venture || "",
    Lead: team.lead || "",
    Sector: team.sector || "",
    Institution: team.institution || "",
    TRL: scores.TRL ?? null,
    BRL: scores.BRL ?? null,
    IPRL: scores.IPRL ?? null,
    MRL: scores.MRL ?? null,
    TMRL: scores.TMRL ?? null,
    Evidence_TRL: evidence.TRL || "",
    Evidence_BRL: evidence.BRL || "",
    Evidence_IPRL: evidence.IPRL || "",
    Evidence_MRL: evidence.MRL || "",
    Evidence_TMRL: evidence.TMRL || "",
    Bottleneck: bottleneck || "",
    BottleneckLevel: bottleneckLevel ?? null,
    AI_PrimaryMechanism: aiRec.primaryMechanism || "",
    AI_Rationale: aiRec.rationale || "",
    AI_SecondaryConstraint: aiRec.secondaryConstraint || "",
    AI_SuggestedAsk: aiRec.suggestedAsk || "",
    Canvas_Jobs: canvas.jobs || "",
    Canvas_Pains: canvas.pains || "",
    Canvas_Gains: canvas.gains || "",
    Canvas_Capability: canvas.capability || "",
    Canvas_GapRelief: canvas.gapRelief || "",
    Canvas_ValueAdd: canvas.valueAdd || "",
    Canvas_Mechanism: canvas.mechanism || "",
    Canvas_DollarFigure: canvas.dollarFigure || "",
    Canvas_Deliverable: canvas.deliverable || "",
    Canvas_Timeline: canvas.timeline || "",
    Status: status || "In Progress",
  };
}

export default async function handler(req, res) {
  if (!AIRTABLE_BASE_ID || !AIRTABLE_PAT) {
    res.status(500).json({ error: "Server is missing AIRTABLE_BASE_ID or AIRTABLE_PAT env vars." });
    return;
  }

  try {
    if (req.method === "GET") {
      let records = [];
      let offset;
      do {
        const url = new URL(AIRTABLE_URL);
        url.searchParams.set("sort[0][field]", "Venture");
        if (offset) url.searchParams.set("offset", offset);
        const r = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } });
        if (!r.ok) throw new Error(`Airtable list failed: ${r.status} ${await r.text()}`);
        const data = await r.json();
        records = records.concat(data.records);
        offset = data.offset;
      } while (offset);

      res.status(200).json({ records });
      return;
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const fields = toAirtableFields(body);

      if (body.recordId) {
        const r = await fetch(`${AIRTABLE_URL}/${body.recordId}`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${AIRTABLE_PAT}`, "Content-Type": "application/json" },
          body: JSON.stringify({ fields }),
        });
        if (!r.ok) throw new Error(`Airtable update failed: ${r.status} ${await r.text()}`);
        const updated = await r.json();
        res.status(200).json(updated);
        return;
      }

      const r = await fetch(AIRTABLE_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${AIRTABLE_PAT}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields }),
      });
      if (!r.ok) throw new Error(`Airtable create failed: ${r.status} ${await r.text()}`);
      const created = await r.json();
      res.status(200).json(created);
      return;
    }

    res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
