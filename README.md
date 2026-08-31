# Workout Book

A private workout log: calendar, workout builder (supersets, drop sets, cardio),
body weight tracking, and an exercise library. Runs as a Node.js server on your
desktop with a React front end, so your desktop and phone share the same data —
no more manual export/import between devices.

- `server/` — Express API + JSON-file data store (`server/data/data.json`, not
  committed to git).
- `client/` — React app (Vite), built and served by the Express server.
- `docs/legacy/` — the original single-file HTML build this app was ported
  from, kept as reference.

## Setup

```bash
npm install
npm run migrate   # one-time: seeds server/data/data.json from docs/legacy's backup JSON
```

## Local development (hot reload)

```bash
npm run dev
```

Starts the API on `http://localhost:3001` and the Vite dev server on
`http://localhost:5173` (proxying `/api` to the server). Open the Vite URL
while developing.

## Running it for real (day-to-day use)

```bash
npm run build
npm start
```

This builds the client and starts a single Express process on port `3001`
that serves both the API and the app — this is the one process you leave
running on your desktop.

## Using it from your phone (Tailscale)

The server binds `0.0.0.0`, so it's reachable from any device once you can
route to it. This app uses [Tailscale](https://tailscale.com) (free for
personal use) for that, so your phone can reach your desktop from anywhere,
not just your home Wi-Fi — fully private, never exposed to the public internet.

1. Install Tailscale on your desktop and your phone, and sign both into the
   same Tailscale account (tailnet).
2. Find your desktop's Tailscale hostname or IP — check the
   [Tailscale admin console](https://login.tailscale.com/admin/machines) or
   run `tailscale ip` on the desktop.
3. On the desktop, run `npm start` (leave it running).
4. On your phone (with Tailscale connected), open
   `http://<your-desktop-tailscale-name>:3001` in the browser.
5. Use the browser's "Add to Home Screen" option to install it as an app.

## Backup

The Backup &amp; Restore modal (topbar icon) exports the full dataset as a
JSON file and can import one back in — imports are merged by record ID, never
overwritten, so it's safe to import an old backup at any time.
