// Analyses a page's raw HTML: GTM containers, hardcoded gtag, other pixels, custom loaders.
(function (root) {
  const TSD = (root.TSD = root.TSD || {});
  const uniq = (a) => [...new Set(a)];

  function analyzeHtml(html, url) {
    const gtmIds = uniq(html.match(/GTM-[A-Z0-9]{4,10}\b/g) || []);
    const googleTagIds = uniq(html.match(/\b(?:G|AW|GT|DC)-[A-Z0-9]{6,15}\b/g) || []);
    const hardcodedGtag = uniq([...html.matchAll(/googletagmanager\.com\/gtag\/js\?id=([A-Z]{1,3}-[A-Z0-9]+)/gi)].map((m) => m[1].toUpperCase()));
    const gtagConfigCalls = uniq([...html.matchAll(/gtag\(\s*['"]config['"]\s*,\s*['"]([A-Z]{1,3}-[A-Z0-9]+)['"]/gi)].map((m) => m[1].toUpperCase()));
    const scriptSrcs = [...html.matchAll(/<script\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
    const tagScripts = uniq(scriptSrcs.filter((s) => /gtm|gtag/i.test(s)));
    const customLoaders = tagScripts.filter((s) => !/googletagmanager\.com/i.test(s));
    const shopify = /cdn\.shopify\.com|Shopify\.theme/i.test(html);
    const notes = [];
    if (!gtmIds.length) notes.push('No GTM ID was found in the page HTML. The site may add GTM with JavaScript (for example Shopify customer events or a plugin), or load it through a custom loader. Find the ID in DevTools or TagScope and paste it here.');
    if (customLoaders.length) notes.push('Tag scripts load from a non-Google domain, which usually means a first-party or Stape custom loader. Paste that script URL here to decode it.');
    if (shopify) notes.push('This is a Shopify store. Tracking set up in Shopify customer events (web pixels) runs in a sandbox and does not appear in the page HTML.');
    return { url, gtmIds, googleTagIds, hardcodedGtag, gtagConfigCalls, tagScripts, customLoaders, platforms: TSD.catalog.detectPlatforms(html), notes };
  }

  TSD.sitescan = { analyzeHtml };
})(typeof globalThis !== 'undefined' ? globalThis : window);
