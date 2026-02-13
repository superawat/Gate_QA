import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../../");

const sourceDir = path.join(projectRoot, "calculator");
const publicDir = path.join(projectRoot, "public", "calculator");
const distDir = path.join(projectRoot, "dist", "calculator");

const args = new Set(process.argv.slice(2));
const shouldCopyPublic = args.has("--public");
const shouldCopyDist = args.has("--dist");

function ensureSourceExists() {
  if (fs.existsSync(sourceDir)) {
    return;
  }
  console.error("Calculator source folder not found at ./calculator");
  process.exit(1);
}

function copyDirectory(fromPath, toPath, label) {
  fs.rmSync(toPath, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(toPath), { recursive: true });
  fs.cpSync(fromPath, toPath, { recursive: true });
  console.log(`Synced calculator assets to ${label}`);
}

ensureSourceExists();

if (!shouldCopyPublic && !shouldCopyDist) {
  copyDirectory(sourceDir, publicDir, "public/calculator");
  if (fs.existsSync(path.join(projectRoot, "dist"))) {
    copyDirectory(sourceDir, distDir, "dist/calculator");
  }
  process.exit(0);
}

if (shouldCopyPublic) {
  copyDirectory(sourceDir, publicDir, "public/calculator");
}

if (shouldCopyDist) {
  const distRoot = path.join(projectRoot, "dist");
  if (!fs.existsSync(distRoot)) {
    console.warn("dist/ not found. Skipping calculator sync to dist.");
    process.exit(0);
  }
  copyDirectory(sourceDir, distDir, "dist/calculator");
}
