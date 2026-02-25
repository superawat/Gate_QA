#!/usr/bin/env node

/**
 * FEAT-003 Stage 1 — Scrape
 *
 * Reads pipeline-state.json for nextTargetYear, discovers tag patterns,
 * paginates through all questions, deduplicates against existing bank UIDs,
 * and saves raw scrape output as audit/raw-scrape-{year}-{timestamp}.json.
 *
 * Respects robots.txt Crawl-delay: 30.
 * On rate limit: retry with exponential backoff × 3, then abort.
 *
 * Usage:
 *   node scripts/pipeline/scrape.mjs [--year 2026]
 */

import fs from "node:fs";
import path from "node:path";
import { JSDOM } from "jsdom";

// ── Configuration ───────────────────────────────────────────────────────
const CRAWL_DELAY_MS = 31_000; // 31s to respect robots.txt Crawl-delay: 30
const MAX_RETRIES = 3;
const USER_AGENT =
    "Mozilla/5.0 (compatible; GateQA-Pipeline/1.0; +https://github.com/superawat/Gate_QA)";
const BASE_URL = "https://gateoverflow.in";

const ROOT = path.resolve(
    path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Z]:)/, "$1")),
    "../.."
);
const STATE_PATH = path.join(ROOT, "pipeline-state.json");
const QUESTIONS_PATH = path.join(ROOT, "public", "questions-with-answers.json");
const QUESTIONS_FILTERED_PATH = path.join(
    ROOT,
    "public",
    "questions-filtered.json"
);
const AUDIT_DIR = path.join(ROOT, "audit");

// ── Helpers ─────────────────────────────────────────────────────────────

function readJson(filePath) {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, data) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function extractGateOverflowId(link = "") {
    const match = String(link || "")
        .trim()
        .match(
            /(?:https?:\/\/)?(?:www\.)?gateoverflow\.in\/(\d+)(?:[/?#]|$)/i
        );
    return match ? match[1] : null;
}

function buildUid(link) {
    const goId = extractGateOverflowId(link);
    return goId ? `go:${goId}` : null;
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, retries = MAX_RETRIES) {
    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const response = await fetch(url, {
                headers: { "User-Agent": USER_AGENT },
                signal: AbortSignal.timeout(30_000),
            });

            if (response.status === 429 || response.status >= 500) {
                const backoff = Math.pow(2, attempt) * 10_000; // 20s, 40s, 80s
                console.warn(
                    `  ⚠ Rate limited/server error (${response.status}) on attempt ${attempt}/${retries}. Waiting ${backoff / 1000}s…`
                );
                if (attempt === retries) {
                    throw new Error(
                        `Rate limited after ${retries} retries: ${response.status} ${url}`
                    );
                }
                await sleep(backoff);
                continue;
            }

            if (!response.ok) {
                throw new Error(`HTTP ${response.status} for ${url}`);
            }

            return await response.text();
        } catch (err) {
            if (attempt === retries) throw err;
            const backoff = Math.pow(2, attempt) * 10_000;
            console.warn(
                `  ⚠ Fetch error on attempt ${attempt}/${retries}: ${err.message}. Retrying in ${backoff / 1000}s…`
            );
            await sleep(backoff);
        }
    }
}

// ── Tag Discovery ───────────────────────────────────────────────────────

function buildTagCandidates(year) {
    // Historical patterns observed:
    // 2024: gatecse-2024-set1, gatecse-2024-set2
    // 2025: gatecse2025-set1, gatecse2025-set2
    // 2026: gatecse-2026-set1, gatecse-2026-set2
    return [
        `gatecse-${year}-set1`,
        `gatecse-${year}-set2`,
        `gatecse${year}-set1`,
        `gatecse${year}-set2`,
        `gate${year}`,
        `gatecse-${year}`,
        `gatecse${year}`,
    ];
}

async function discoverActiveTags(year) {
    const candidates = buildTagCandidates(year);
    const activeTags = [];

    for (const tag of candidates) {
        const url = `${BASE_URL}/tag/${tag}`;
        console.log(`  Probing tag: ${url}`);
        try {
            const html = await fetchWithRetry(url);
            const dom = new JSDOM(html);
            const doc = dom.window.document;

            // Check if the page has question links
            const links = doc.querySelectorAll("a[href]");
            let hasQuestions = false;
            for (const a of links) {
                const href = a.getAttribute("href") || "";
                if (/\/\d+\//.test(href) && /gate/i.test(href)) {
                    hasQuestions = true;
                    break;
                }
            }

            if (hasQuestions) {
                activeTags.push(tag);
                console.log(`    ✓ Active: ${tag}`);
            } else {
                console.log(`    ✗ Empty: ${tag}`);
            }
        } catch (err) {
            console.log(`    ✗ Error probing ${tag}: ${err.message}`);
        }
        await sleep(CRAWL_DELAY_MS);
    }

    return activeTags;
}

// ── Pagination & Link Extraction ────────────────────────────────────────

async function getQuestionLinksFromTag(tag) {
    const questionLinks = [];
    let page = 1;

    while (true) {
        const url = `${BASE_URL}/tag/${tag}?start=${(page - 1) * 20}`;
        console.log(`  Fetching tag page: ${url}`);

        let html;
        try {
            html = await fetchWithRetry(url);
        } catch (err) {
            console.error(`  Failed to fetch tag page: ${err.message}`);
            break;
        }

        const dom = new JSDOM(html);
        const doc = dom.window.document;

        const foundLinks = [];
        for (const a of doc.querySelectorAll("a[href]")) {
            let href = a.getAttribute("href") || "";

            // Construct absolute URL
            let fullUrl;
            if (href.startsWith("http")) {
                fullUrl = href;
            } else {
                const clean = href.replace(/^\.\.?\/?/, "");
                fullUrl = `${BASE_URL}/${clean}`;
            }

            // Match question URLs: /12345/gate-cse-...
            if (/\/\d+\//.test(fullUrl) && /gate.*cse/i.test(fullUrl)) {
                if (!foundLinks.includes(fullUrl)) {
                    foundLinks.push(fullUrl);
                }
            }
        }

        if (!foundLinks.length) {
            console.log(`  No more questions found on page ${page}`);
            break;
        }

        console.log(`    Found ${foundLinks.length} question links on page ${page}`);
        questionLinks.push(...foundLinks);

        // Check for next page link
        const hasNext = Array.from(doc.querySelectorAll("a")).some((a) =>
            /next|›|>>/.test(a.textContent || "")
        );
        if (!hasNext) break;

        page++;
        await sleep(CRAWL_DELAY_MS);
    }

    // Deduplicate
    return [...new Set(questionLinks)];
}

// ── Question Scraping ───────────────────────────────────────────────────

async function scrapeQuestion(url) {
    let html;
    try {
        html = await fetchWithRetry(url);
    } catch (err) {
        console.error(`    Failed to scrape: ${err.message}`);
        return null;
    }

    const dom = new JSDOM(html);
    const doc = dom.window.document;

    // Title
    let title = "Unknown";
    const h1 =
        doc.querySelector(".qa-main-heading h1") || doc.querySelector("h1");
    if (h1) {
        title = h1.textContent.trim().replace(/\s*[-–|].*?GATE Overflow.*$/i, "");
    }

    // Question HTML
    const qContent =
        doc.querySelector(".qa-q-view-content .entry-content") ||
        doc.querySelector(".qa-q-view-content") ||
        doc.querySelector(".entry-content");

    let questionHtml = "";
    if (qContent) {
        // Remove metadata/ads
        for (const bad of qContent.querySelectorAll(
            ".qa-q-view-who, .qa-q-view-when, .qa-q-view-flags, .qa-q-view-buttons"
        )) {
            bad.remove();
        }
        questionHtml = qContent.innerHTML;
    }

    // Tags
    const tags = [];
    for (const t of doc.querySelectorAll(".qa-tag-link")) {
        const tagText = t.textContent.trim();
        if (tagText && !tags.includes(tagText)) {
            tags.push(tagText);
        }
    }

    // Year tag
    const yearTag = tags.find((t) => /^gatecse/i.test(t)) || "";

    return {
        title,
        year: yearTag,
        link: url,
        question: questionHtml,
        tags,
    };
}

// ── Main ────────────────────────────────────────────────────────────────

async function main() {
    // Parse args
    const args = process.argv.slice(2);
    let forceYear = null;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === "--year" && args[i + 1]) {
            forceYear = parseInt(args[i + 1], 10);
        }
    }

    // Read pipeline state
    const state = readJson(STATE_PATH);
    if (!state) {
        console.error("❌ pipeline-state.json not found");
        process.exit(1);
    }

    const targetYear = forceYear || state.nextTargetYear;
    console.log(`\n🔍 FEAT-003 Stage 1 — Scrape for year ${targetYear}\n`);

    // Load existing UIDs for deduplication
    const existingUids = new Set();
    for (const filePath of [QUESTIONS_PATH, QUESTIONS_FILTERED_PATH]) {
        const data = readJson(filePath);
        if (Array.isArray(data)) {
            for (const q of data) {
                const uid = buildUid(q.link);
                if (uid) existingUids.add(uid);
            }
        }
    }
    console.log(`  Loaded ${existingUids.size} existing UIDs for dedup\n`);

    // Discover active tags for this year
    const activeTags = await discoverActiveTags(targetYear);
    if (!activeTags.length) {
        console.log(
            `\n📭 No active tags found for ${targetYear}. Off-cycle — exiting cleanly.`
        );
        // Write empty audit file
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        writeJson(path.join(AUDIT_DIR, `raw-scrape-${targetYear}-${timestamp}.json`), {
            year: targetYear,
            status: "off-cycle",
            activeTags: [],
            newQuestions: [],
            timestamp: new Date().toISOString(),
        });
        // Signal to workflow: zero new questions
        console.log("::set-output name=new_question_count::0");
        process.exit(0);
    }

    console.log(
        `\n✅ Active tags for ${targetYear}: ${activeTags.join(", ")}\n`
    );

    // Collect all question links from all active tags
    const allLinks = new Set();
    for (const tag of activeTags) {
        console.log(`\nProcessing tag: ${tag}`);
        const links = await getQuestionLinksFromTag(tag);
        console.log(`  Total links for ${tag}: ${links.length}`);
        links.forEach((l) => allLinks.add(l));
        await sleep(CRAWL_DELAY_MS);
    }

    console.log(`\n📊 Total unique links discovered: ${allLinks.size}`);

    // Filter out already-known UIDs
    const newLinks = [];
    for (const link of allLinks) {
        const uid = buildUid(link);
        if (!uid || existingUids.has(uid)) continue;
        newLinks.push(link);
    }

    console.log(`  New (not in existing bank): ${newLinks.length}\n`);

    if (!newLinks.length) {
        console.log(
            `\n📭 Zero new questions found for ${targetYear}. Off-cycle — exiting cleanly.`
        );
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        writeJson(path.join(AUDIT_DIR, `raw-scrape-${targetYear}-${timestamp}.json`), {
            year: targetYear,
            status: "off-cycle-no-new",
            activeTags,
            discoveredLinks: allLinks.size,
            existingUids: existingUids.size,
            newQuestions: [],
            timestamp: new Date().toISOString(),
        });
        console.log("::set-output name=new_question_count::0");
        process.exit(0);
    }

    // Scrape each new question
    const scraped = [];
    for (let i = 0; i < newLinks.length; i++) {
        const link = newLinks[i];
        console.log(`  Scraping [${i + 1}/${newLinks.length}]: ${link}`);
        const q = await scrapeQuestion(link);
        if (q && q.question) {
            scraped.push(q);
        } else {
            console.log(`    ⚠ Failed to extract content`);
        }
        await sleep(CRAWL_DELAY_MS);
    }

    console.log(`\n✅ Successfully scraped ${scraped.length} new questions`);

    // Save raw audit file
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const auditPath = path.join(
        AUDIT_DIR,
        `raw-scrape-${targetYear}-${timestamp}.json`
    );
    writeJson(auditPath, {
        year: targetYear,
        status: "scraped",
        activeTags,
        discoveredLinks: allLinks.size,
        existingUids: existingUids.size,
        newQuestionCount: scraped.length,
        newQuestions: scraped,
        timestamp: new Date().toISOString(),
    });
    console.log(`  Audit file: ${auditPath}`);

    // Output for subsequent stages
    const outputPath = path.join(ROOT, "audit", `scraped-${targetYear}.json`);
    writeJson(outputPath, scraped);
    console.log(`  Stage output: ${outputPath}`);

    // GitHub Actions output
    console.log(`::set-output name=new_question_count::${scraped.length}`);
    console.log(`::set-output name=target_year::${targetYear}`);
}

main().catch((err) => {
    console.error(`\n❌ Scrape failed: ${err.message}`);
    // Write error info for issue creation
    const errorPath = path.join(ROOT, "audit", "scrape-error.json");
    writeJson(errorPath, {
        error: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
    });
    process.exit(1);
});
