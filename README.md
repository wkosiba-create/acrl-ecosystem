# Atlantic Ecosystem Mapper — L2M
## Deploying to Vercel (step-by-step, ~15 minutes)

### What you'll need
- A free Vercel account (vercel.com)
- A free GitHub account (github.com)
- This project folder

---

### Step 1 — Install Node.js (if you don't have it)
Download from https://nodejs.org and install the LTS version.

### Step 2 — Install dependencies
Open a terminal in this folder and run:
```
npm install
```

### Step 3 — Push to GitHub
1. Go to github.com → New repository → name it `acrl-ecosystem`
2. On your computer, open a terminal in this folder and run:
```
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/acrl-ecosystem.git
git push -u origin main
```

### Step 4 — Deploy on Vercel
1. Go to vercel.com → Log in → "Add New Project"
2. Import your `acrl-ecosystem` GitHub repository
3. Leave all settings as default — click **Deploy**
4. Vercel gives you a URL like `acrl-ecosystem.vercel.app`

### Step 5 — Customize your URL (optional)
In Vercel dashboard → Settings → Domains → Add a custom domain like `l2m-ecosystem.vercel.app`

---

### How it works on the day
- **Attendees**: Open the URL on their phone or laptop → Questionnaire tab
- **Facilitator screen**: Open the URL → Live Map tab (auto-refreshes every 8 seconds)
- **After submission**: Attendees click "Download my summary slides" to get their .pptx
- **Admin / data export**: Admin tab → password `L2M2026` → Download CSV

### Changing the admin password
Edit `/api/submissions.js` — search for `L2M2026` and replace it.
Also edit the same password in `/public/index.html`.

---

### Note on data persistence
The serverless functions keep data in memory — perfect for a single workshop day.
If you need data to persist across days or server restarts, upgrade to Vercel KV (free tier available).
All data is also exportable as CSV from the Admin tab at any time.

---
Built for L2M Atlantic Ecosystem Mapping Workshop — June 4, 2026
