# Hosting TagScope Decoder on GitHub Pages

This guide has two parts:

- **Part A** puts the website online for free at `https://YOUR-USERNAME.github.io/tagscope-decoder/`.
- **Part B** adds a small free "proxy" so the hosted site can fetch gtm.js from any URL, the way GA4 Spy does.

You need Part B because a browser is not allowed to read gtm.js from Google directly (a browser security rule called CORS blocks it). On your own computer the local server handles this. Once the site is on the internet, a tiny Cloudflare Worker does the same job. Both are free.

Total time: about 20 minutes. No coding needed, just copy and paste.

---

## Before you start

Create two free accounts if you don't have them:

1. **GitHub** — https://github.com/signup
2. **Cloudflare** — https://dash.cloudflare.com/sign-up (only needed for Part B)

---

## Part A — Put the site on GitHub Pages

### Step 1: Create the repository

1. Go to https://github.com/new
2. **Repository name:** `tagscope-decoder`
3. Set it to **Public** (GitHub Pages is free only for public repos on the free plan).
4. Do **not** tick "Add a README".
5. Click **Create repository**.

### Step 2: Upload the files

1. On the new repository page, click **uploading an existing file** (the link in the middle).
2. Open the `tagscope-decoder` folder on your computer, select **everything inside it** (all files and folders), and drag them into the browser.
   - Make sure the hidden files come too: `.nojekyll` and the `.github` folder. If your file explorer hides them, turn on "show hidden files" first. The `.nojekyll` file is important — without it GitHub ignores the `js` folder.
3. Wait for every file to finish uploading (you'll see them listed).
4. At the bottom, click **Commit changes**.

### Step 3: Turn on GitHub Pages

1. In the repository, click **Settings** (top right).
2. In the left menu, click **Pages**.
3. Under **Build and deployment** → **Source**, choose **GitHub Actions**.
   - A suggested workflow may appear. Ignore it — the project already includes one at `.github/workflows/deploy.yml`.
4. Click **Actions** in the top menu. You'll see a workflow named "Deploy to GitHub Pages" running. Wait for the green tick (about a minute).

### Step 4: Open your site

Your site is now live at:

```
https://YOUR-USERNAME.github.io/tagscope-decoder/
```

Replace `YOUR-USERNAME` with your GitHub username. Bookmark it.

At this point, **"Paste gtm.js source"** already works fully. Decoding by ID or website needs Part B.

---

## Part B — Add the fetch proxy (Cloudflare Worker)

This is the piece that lets you type a website or GTM ID and have it fetched automatically.

### Step 1: Create the Worker

1. Sign in at https://dash.cloudflare.com/
2. In the left menu, click **Compute (Workers)** → **Workers & Pages** (older accounts call it just **Workers & Pages**).
3. Click **Create application** → **Create Worker**.
4. **Name it** `tagscope-proxy`. This name becomes part of your proxy URL, so keep it simple.
5. Click **Deploy** (it deploys a placeholder for now).

### Step 2: Paste in the proxy code

1. On the worker's page, click **Edit code** (top right).
2. Delete everything in the editor.
3. Open `worker/cloudflare-worker.js` from the project, copy all of it, and paste it in.
4. Click **Deploy** (top right).

### Step 3: Lock the proxy to your site

This stops other people from using your proxy.

1. Go back to the worker's overview page.
2. Click **Settings** → **Variables and Secrets** (older UI: **Settings → Variables**).
3. Under **Environment Variables**, click **Add variable**.
   - **Variable name:** `ALLOWED_ORIGINS`
   - **Value:** `https://YOUR-USERNAME.github.io` (your Pages address, no trailing slash, no path)
4. Click **Deploy** (or **Save and deploy**).

### Step 4: Find your proxy URL

On the worker's overview page, near the top, you'll see its address, something like:

```
https://tagscope-proxy.YOUR-NAME.workers.dev
```

Copy it. Test it works by opening `https://tagscope-proxy.YOUR-NAME.workers.dev/health` in a new tab — it should show `{"ok":true,"app":"tagscope-proxy"}`.

### Step 5: Connect the proxy to your site

You have two ways. Pick one.

**Option 1 — bake it in for everyone (recommended)**

1. In your GitHub repository, open `js/config.js`.
2. Click the pencil icon to edit.
3. Put your proxy URL between the quotes:
   ```js
   window.TSD_CONFIG = {
     proxyUrl: 'https://tagscope-proxy.YOUR-NAME.workers.dev',
   };
   ```
4. Click **Commit changes**. The site redeploys in about a minute, and anyone who visits can decode by ID or website with nothing to set up.

**Option 2 — set it only in your own browser**

1. Open your live site.
2. Click the gear icon (Settings) → **Fetch proxy**.
3. Paste the proxy URL, click **Test**, then **Save**.

This is stored only in your browser, which is handy for trying it before committing the change.

### Done

Open your site and decode `www.brainvire.com`. The status chip near the top right should read **Hosted proxy**. You now have the same "audit from any URL" flow that GA4 Spy offers.

---

## Optional: a nicer address

The default `github.io` URL is fine. If you later buy a domain (for example `tagscope.in`), you can point it at the site:

1. In your repository: **Settings → Pages → Custom domain**, enter your domain, save.
2. At your domain registrar, add the DNS records GitHub shows you.
3. Update `ALLOWED_ORIGINS` in the Cloudflare Worker to your new domain, and `proxyUrl` in `config.js` stays the same.

---

## Keeping it updated

When I send you an improved version, update the files in the repository (drag-and-drop the changed files, or edit them in place) and commit. GitHub Pages redeploys automatically. Your Cloudflare Worker doesn't need touching unless `worker/cloudflare-worker.js` itself changed.

---

## Troubleshooting

**The site loads but the `js` folder 404s / nothing works.** The `.nojekyll` file didn't upload. Add an empty file named exactly `.nojekyll` to the repository root and commit.

**Status chip says "Proxy unreachable".** Open `https://YOUR-PROXY/health` directly. If that fails, the worker isn't deployed. If it works but the app still fails, `ALLOWED_ORIGINS` doesn't exactly match your site address — check for a trailing slash or http/https mismatch.

**A specific site returns an error when decoding.** Some sites block automated requests (Cloudflare bot protection, for example). Use "Paste gtm.js source" for those: open the site, in DevTools Network tab filter for `gtm.js`, copy the Response, and paste it in.

**Cloudflare free limits.** The free plan allows 100,000 worker requests a day. One audit is only a few requests, so for team use you'll never get close.
