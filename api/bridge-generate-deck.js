// api/bridge-generate-deck.js
// GET ?id=recXXXXXXXXXXXXXX -> streams a 2-slide .pptx built from that Airtable record

import pptxgen from "pptxgenjs";

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME || "Submissions";
const AIRTABLE_PAT = process.env.AIRTABLE_PAT;

const NAVY = "1E2761";
const PURPLE = "5B3A8E";
const NAVY_TINT = "EEF1FB";
const PURPLE_TINT = "F5F0FC";
const ROSE = "C24E6B";
const ROSE_TINT = "FBEAF0";
const GRAY = "6B6B78";
const WHITE = "FFFFFF";

const DIM_LABELS = { TRL: "TRL", BRL: "BRL", IPRL: "IP-RL", MRL: "MRL", TMRL: "TM-RL" };
const DIM_ORDER = ["TRL", "BRL", "IPRL", "MRL", "TMRL"];

function safeName(s) {
  return (s || "team").replace(/[^a-z0-9]+/gi, "_").replace(/^_+|_+$/g, "").slice(0, 60) || "team";
}

function addHeaderBar(slide, title, subtitle) {
  slide.addShape("rect", { x: 0, y: 0, w: 13.33, h: 1.05, fill: { color: NAVY }, line: { type: "none" } });
  slide.addText(title, { x: 0.4, y: 0.12, w: 12.5, h: 0.55, fontFace: "Cambria", fontSize: 22, bold: true, color: WHITE, margin: 0 });
  slide.addText(subtitle, { x: 0.4, y: 0.62, w: 12.5, h: 0.35, fontFace: "Calibri", fontSize: 12, italic: true, color: "CADCFC", margin: 0 });
}

export function buildDeck(f) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE";

  const bottleneckKey = f.Bottleneck;
  const bottleneckLabel = DIM_LABELS[bottleneckKey] || bottleneckKey || "\u2014";

  // ---------- Slide 1: Diagnose & Route ----------
  const s1 = pres.addSlide();
  s1.background = { color: WHITE };
  addHeaderBar(s1, f.Venture || "Untitled venture", `${f.Sector || "Sector not specified"} \u00b7 Diagnose & Route \u00b7 Canada\u2013Japan Deep Tech Program`);

  const radarData = [{
    name: "Readiness",
    labels: DIM_ORDER.map((k) => DIM_LABELS[k]),
    values: DIM_ORDER.map((k) => Number(f[k]) || 0),
  }];
  s1.addChart(pres.ChartType.radar, radarData, {
    x: 0.4, y: 1.25, w: 6.1, h: 5.6,
    chartColors: [PURPLE],
    radarStyle: "filled",
    showLegend: false,
    valAxisMaxVal: 9, valAxisMinVal: 0, valAxisMajorUnit: 3,
    catAxisLabelFontSize: 12, catAxisLabelColor: NAVY, catAxisLabelFontBold: true,
    valAxisLabelFontSize: 8, valAxisLabelColor: GRAY,
    lineSize: 2, lineDataSymbol: "circle", lineDataSymbolSize: 6,
  });

  s1.addShape("roundRect", { x: 6.75, y: 1.25, w: 6.15, h: 1.35, rectRadius: 0.08, fill: { color: ROSE_TINT }, line: { type: "none" } });
  s1.addText([
    { text: "\u26A0 BOTTLENECK   ", options: { bold: true, color: ROSE, fontSize: 12 } },
    { text: `${bottleneckLabel} \u2014 ${f.BottleneckLevel ?? f[bottleneckKey] ?? "?"}/9`, options: { bold: true, color: "1A1A1A", fontSize: 16 } },
  ], { x: 6.95, y: 1.4, w: 5.8, h: 0.45, fontFace: "Calibri", margin: 0 });
  s1.addText(f[`Evidence_${bottleneckKey}`] || "No evidence artifact recorded.", {
    x: 6.95, y: 1.85, w: 5.8, h: 0.65, fontFace: "Calibri", fontSize: 11, italic: true, color: "555555", margin: 0,
  });

  s1.addShape("roundRect", { x: 6.75, y: 2.75, w: 6.15, h: 3.1, rectRadius: 0.08, fill: { color: PURPLE_TINT }, line: { type: "none" } });
  s1.addText("RECOMMENDED MECHANISM", { x: 6.95, y: 2.9, w: 5.75, h: 0.3, fontFace: "Calibri", fontSize: 11, bold: true, color: PURPLE, margin: 0 });
  s1.addText(f.AI_PrimaryMechanism || "No recommendation captured.", { x: 6.95, y: 3.2, w: 5.75, h: 0.5, fontFace: "Calibri", fontSize: 14, bold: true, color: "1A1A1A", margin: 0 });
  s1.addText(f.AI_Rationale || "", { x: 6.95, y: 3.7, w: 5.75, h: 0.95, fontFace: "Calibri", fontSize: 11, color: "444444", margin: 0 });
  if (f.AI_SecondaryConstraint) {
    s1.addText([
      { text: "Also watch: ", options: { bold: true, fontSize: 10.5, color: "1A1A1A" } },
      { text: f.AI_SecondaryConstraint, options: { fontSize: 10.5, color: "555555" } },
    ], { x: 6.95, y: 4.7, w: 5.75, h: 0.55, fontFace: "Calibri", margin: 0 });
  }
  if (f.AI_SuggestedAsk) {
    s1.addText(`\u201c${f.AI_SuggestedAsk}\u201d`, { x: 6.95, y: 5.3, w: 5.75, h: 0.5, fontFace: "Calibri", fontSize: 11, italic: true, color: PURPLE, margin: 0 });
  }

  s1.addText("Canada\u2013Japan Deep Tech Commercialization Program \u00b7 Bilateral Bridge Tool", {
    x: 0.4, y: 7.12, w: 12.5, h: 0.3, fontFace: "Calibri", fontSize: 9, color: "9A9A9A", margin: 0,
  });

  // ---------- Slide 2: Bilateral Value Proposition ----------
  const s2 = pres.addSlide();
  s2.background = { color: WHITE };
  addHeaderBar(s2, f.Venture || "Untitled venture", "Bilateral Value Proposition \u00b7 Pitch");

  const colW = 6.15, colY = 1.25, colH = 4.55;
  s2.addShape("roundRect", { x: 0.4, y: colY, w: colW, h: colH, rectRadius: 0.08, fill: { color: NAVY_TINT }, line: { type: "none" } });
  s2.addText("YOUR PARTNER", { x: 0.6, y: colY + 0.15, w: colW - 0.4, h: 0.35, fontFace: "Calibri", fontSize: 13, bold: true, color: NAVY, margin: 0 });
  [["Jobs", f.Canvas_Jobs], ["Pains", f.Canvas_Pains], ["Gains", f.Canvas_Gains]].forEach(([label, val], i) => {
    const py = colY + 0.65 + i * 1.3;
    s2.addText(label, { x: 0.6, y: py, w: colW - 0.4, h: 0.3, fontFace: "Calibri", fontSize: 11.5, bold: true, color: "1A1A1A", margin: 0 });
    s2.addText(val || "\u2014", { x: 0.6, y: py + 0.32, w: colW - 0.4, h: 0.9, fontFace: "Calibri", fontSize: 10.5, color: "444444", margin: 0 });
  });

  s2.addShape("roundRect", { x: 6.75, y: colY, w: colW, h: colH, rectRadius: 0.08, fill: { color: PURPLE_TINT }, line: { type: "none" } });
  s2.addText("WHAT YOU BRING", { x: 6.95, y: colY + 0.15, w: colW - 0.4, h: 0.35, fontFace: "Calibri", fontSize: 13, bold: true, color: PURPLE, margin: 0 });
  [["Capability", f.Canvas_Capability], ["Gap-relief", f.Canvas_GapRelief], ["Value-add", f.Canvas_ValueAdd]].forEach(([label, val], i) => {
    const py = colY + 0.65 + i * 1.3;
    s2.addText(label, { x: 6.95, y: py, w: colW - 0.4, h: 0.3, fontFace: "Calibri", fontSize: 11.5, bold: true, color: "1A1A1A", margin: 0 });
    s2.addText(val || "\u2014", { x: 6.95, y: py + 0.32, w: colW - 0.4, h: 0.9, fontFace: "Calibri", fontSize: 10.5, color: "444444", margin: 0 });
  });

  const askY = colY + colH + 0.2;
  s2.addShape("roundRect", { x: 0.4, y: askY, w: 12.5, h: 1.15, rectRadius: 0.08, fill: { color: "F5F5F5" }, line: { type: "none" } });
  const asks = [
    ["Mechanism", f.Canvas_Mechanism], ["Dollar figure", f.Canvas_DollarFigure],
    ["Joint deliverable", f.Canvas_Deliverable], ["Timeline", f.Canvas_Timeline],
  ];
  const askColW = 12.5 / 4;
  asks.forEach(([label, val], i) => {
    const x = 0.4 + i * askColW;
    s2.addText(label.toUpperCase(), { x: x + 0.15, y: askY + 0.12, w: askColW - 0.3, h: 0.28, fontFace: "Calibri", fontSize: 9.5, bold: true, color: PURPLE, margin: 0 });
    s2.addText(val || "\u2014", { x: x + 0.15, y: askY + 0.42, w: askColW - 0.3, h: 0.65, fontFace: "Calibri", fontSize: 11, color: "1A1A1A", margin: 0 });
  });

  return pres;
}

export default async function handler(req, res) {
  const { id } = req.query || {};
  if (!id) {
    res.status(400).json({ error: "Missing ?id= (Airtable record ID)" });
    return;
  }
  if (!AIRTABLE_BASE_ID || !AIRTABLE_PAT) {
    res.status(500).json({ error: "Server is missing AIRTABLE_BASE_ID or AIRTABLE_PAT env vars." });
    return;
  }

  try {
    const url = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}/${id}`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${AIRTABLE_PAT}` } });
    if (!r.ok) throw new Error(`Airtable fetch failed: ${r.status} ${await r.text()}`);
    const record = await r.json();

    const pres = buildDeck(record.fields || {});
    const buffer = await pres.write({ outputType: "nodebuffer" });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.presentationml.presentation");
    res.setHeader("Content-Disposition", `attachment; filename="${safeName(record.fields?.Venture)}.pptx"`);
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
