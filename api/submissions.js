// Vercel serverless function — /api/submissions
// GET: returns all submissions
// POST: saves a new submission
// DELETE: removes a submission by id (query: ?id=...)

// In-memory store (persists as long as the serverless instance is warm).
// For production persistence, replace with a database (e.g. Vercel KV / Upstash Redis).
// For a one-day workshop this works perfectly fine.

let submissions = [];

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.status(200).json(submissions);
  }

  if (req.method === 'POST') {
    const sub = req.body;
    sub.id = Date.now();
    sub.ts = new Date().toISOString();
    submissions.push(sub);
    return res.status(201).json({ ok: true, id: sub.id });
  }

  if (req.method === 'DELETE') {
    const id = Number(req.query.id);
    submissions = submissions.filter(s => s.id !== id);
    return res.status(200).json({ ok: true });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
