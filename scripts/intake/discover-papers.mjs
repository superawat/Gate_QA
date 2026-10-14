import fs from "node:fs";
import path from "node:path";

const BRANCHES = ["ec", "ee", "me", "ce"];
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";

async function discover() {
  const catalog = {};
  for (const branch of BRANCHES) {
    const url = `https://practicepaper.in/gate-${branch}/gate-${branch}-year-wise-questions`;
    try {
      const res = await fetch(url, { headers: { "user-agent": USER_AGENT } });
      if (!res.ok) {
        console.warn(`Could not fetch ${url}: HTTP ${res.status}`);
        continue;
      }
      const html = await res.text();
      const regex = /href=["']([^"']+)["']/gi;
      const found = new Set();
      let m;
      while ((m = regex.exec(html)) !== null) {
        const link = m[1];
        if (link.includes(`gate-${branch}-`) && (link.includes("20") || link.includes("19"))) {
          const fullUrl = link.startsWith("http") ? link : `https://practicepaper.in${link.startsWith("/") ? "" : "/"}${link}`;
          found.add(fullUrl);
        }
      }
      catalog[branch] = Array.from(found).sort();
      console.log(`Branch ${branch.toUpperCase()}: found ${catalog[branch].length} papers.`);
      console.log(catalog[branch]);
    } catch (err) {
      console.error(`Error for ${branch}:`, err.message);
    }
  }

  fs.writeFileSync("audit/discovered-papers.json", JSON.stringify(catalog, null, 2));
  console.log("Saved to audit/discovered-papers.json");
}

discover();
