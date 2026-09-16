# TagScope Decoder

Decode any published Google Tag Manager container without account access. Enter a GTM ID, a
Google tag ID, a website, or paste a gtm.js file, and see every live tag, trigger, and variable
laid out like the GTM interface, with audit findings and version-change tracking.

Built by **Tapasvi Dudhrejiya** — [dudhrejiyatapasvi@gmail.com](mailto:dudhrejiyatapasvi@gmail.com) · [LinkedIn](https://www.linkedin.com/in/tapasvi-dudhrejiya/)

## Two ways to run it

**Locally** (for development and private use):

```
node server.js
```

Then open http://localhost:3000. Needs Node 18+. Nothing to install. On Windows, if `npm start`
is blocked, use `node server.js`.

**Hosted on GitHub Pages** (for the whole team, from any browser): see `DEPLOY.md`. You host the
static site on GitHub Pages for free and add a small free Cloudflare Worker that fetches gtm.js,
which gives you the same "audit from any URL" flow as GA4 Spy.

## What you can enter

| Input | Result |
|---|---|
| `GTM-XXXXXXX` | The live published container |
| `G-XXXXXXXXXX` / `AW-XXXXXXXXX` | Google tag (gtag.js) settings |
| `example.com` | Every container on the page, plus hardcoded-tag checks |
| A gtm.js URL | That exact script (custom or Stape loaders) |
| Pasted source | Any gtm.js text, works with no proxy at all |

## What it shows

- **Overview** — a summary strip (tags, triggers, variables, destinations, IDs, container weight) with active/paused/unused counts, top findings, tags by type, measurement IDs, and platforms.
- **Findings** — prioritised audit: UA leftovers, duplicate Google tags, purchase events without
  transaction data, missing Conversion Linker, no consent setup, page-vs-GTM duplicate pixels,
  orphaned tags, server-side detection, and more.
- **Tags** — GTM-style list with platform badges and firing-trigger chips. Click any tag for a
  detail drawer with its settings, HTML, triggers, exceptions, sequencing, and consent.
- **Triggers** — rebuilt from each rule's event and conditions, with the listener settings
  (scroll depths, timer interval, and so on) and every tag that uses it.
- **Variables** — built-in and user-defined, each with its value and where it's referenced. Unused variables are flagged and filterable.
- **Templates** — community and custom templates with the permissions each one holds (what
  scripts it injects, what globals it touches).
- **Stats** — where data goes, plus breakdown-by-type bars for tags, triggers, and variables.
- **Changes** — every decoded version is saved in your browser, so you can compare publishes.
- **Raw config** — the compiled container as published.

Three naming styles (Settings → Naming style): **Readable** ("Meta Pixel - Purchase", the default),
**Em-dash** (GTM Spy style, "Meta Pixel — Purchase"), or **Convention** ("Meta - cHTML - Purchase"). GTM strips real names before publishing, so names are
generated from each item's settings either way.

Export: CSV and copy-for-Sheets on every table, plus a print/PDF report.

## What no tool can see

GTM removes these before publishing: real tag, trigger, and variable names; folders; notes;
unpublished workspace changes; version history; user permissions; and anything inside a
server-side container. Names here are generated, and clearly marked as such.

## Project layout

```
index.html            the app shell
assets/styles.css     styling
js/core/              decoder engine (shared by browser and local server)
  catalog.js          GTM function codes, platforms, pixel-event patterns
  parser.js           extracts the config from gtm.js
  naming.js           builds readable and convention names
  decoder.js          tags, triggers, variables, templates
  audit.js            audit findings
  sitescan.js         website HTML analysis
  snapshots.js        version snapshots in browser storage
  scan.js             ties it together
js/app.js             the interface
js/net.js             chooses local server / hosted proxy / paste
js/config.js          your proxy URL for the hosted version
server.js             local server + fetch proxy
worker/               Cloudflare Worker proxy for the hosted version
.github/workflows/    auto-deploy to GitHub Pages
test/                 fixture container and tests (npm test)
DEPLOY.md             full GitHub Pages + proxy hosting guide
```

## Tests

```
npm test
```
