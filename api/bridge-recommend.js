// api/bridge-recommend.js
// POST { venture, sector, scores, evidence, bottleneck } -> grounded mechanism recommendation

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const DIMENSIONS = [
  { key: "TRL", full: "Technology Readiness", mechanism: "NSERC\u2013JST joint research calls; bilateral research MOUs" },
  { key: "BRL", full: "Business Readiness", mechanism: "JETRO + Canada's Trade Commissioner Service \u2014 market matchmaking" },
  { key: "IPRL", full: "IP Readiness", mechanism: "Tech-transfer-office bilateral agreements; FTO / patent support" },
  { key: "MRL", full: "Manufacturing Readiness", mechanism: "NRC IRAP (Canada) + NEDO (Japan) \u2014 applied industrial scale-up funding" },
  { key: "TMRL", full: "Team Readiness", mechanism: "Mitacs internships; JSPS fellowships for researcher exchange" },
];

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }
  if (!ANTHROPIC_API_KEY) {
    res.status(500).json({ error: "Server is missing ANTHROPIC_API_KEY env var." });
    return;
  }

  try {
    const { venture, sector, scores = {}, evidence = {}, bottleneck } = req.body || {};

    const mechanismTable = DIMENSIONS.map((d) => `- ${d.key} (${d.full}): ${d.mechanism}`).join("\n");
    const scoreSummary = DIMENSIONS
      .map((d) => `${d.key}=${scores[d.key]}/9${evidence[d.key] ? ` (evidence: ${evidence[d.key]})` : ""}`)
      .join(", ");

    const system = `You are advising teams in a Canada-Japan deep tech commercialization program. Ventures score five ACRL dimensions 1-9. Their bottleneck (lowest score) caps overall readiness. Use ONLY the mechanisms in this reference table -- do not invent programs:\n${mechanismTable}\n\nRespond with ONLY valid JSON, no markdown fences, no preamble, in this exact shape:\n{"primaryMechanism": "string naming the mechanism tied to the bottleneck dimension", "rationale": "2-3 sentences on why this fits their specific stage, referencing their evidence", "secondaryConstraint": "the next-lowest dimension and a one-sentence note on watching it", "suggestedAsk": "one sentence modeling a specific, fundable ask they could bring to this mechanism"}`;

    const userMsg = `Venture: ${venture || "Unnamed venture"} (${sector || "sector not specified"})\nScores: ${scoreSummary}\nBottleneck: ${bottleneck}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system,
        messages: [{ role: "user", content: userMsg }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Anthropic API error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    const raw = textBlock ? textBlock.text : "{}";
    const clean = raw.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
