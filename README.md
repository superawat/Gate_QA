# Gate_QA 🚀

**Gate_QA** is a specialized practice platform for GATE Computer Science & Information Technology (CS/IT) aspirants. It provides a clean, focused, and offline-first interface for solving previous year questions (PYQs) with built-in evaluation and support tools.

[![Live Site](https://img.shields.io/badge/Live-Site-brightgreen)](https://superawat.github.io/Gate_QA/)

---

## 📖 Table of Contents
- [User Guide (For Students)](#-user-guide-for-students)
- [Developer Quickstart](#-developer-quickstart)
- [How it Works (Architecture)](#-how-it-works-architecture)
- [Data & Pipeline](#-data--pipeline)
- [FAQ & Troubleshooting](#-faq--troubleshooting)
- [Performance & Security](#-performance--security)
- [License & Attribution](#-license--attribution)

---

## 🖼️ Screenshots
*To be added - placeholders indicate suggested captures*

| Main Interface | Filter Panel |
| :---: | :---: |
| ![Home Interface](docs/images/home-desktop.png) | ![Filters Sidebar](docs/images/filters-sidebar.png) |
| *Question practice area* | *Subject & Year filters* |

| Calculator Widget | Dark Mode |
| :---: | :---: |
| ![Calculator Widget](docs/images/calculator-widget.png) | ![Dark theme variant](docs/images/dark-mode.png) |
| *TCS Scientific Calculator* | *Eye-saver theme* |

---

## 🎓 User Guide (For Students)

### In Simple Terms
Gate_QA is like a digital question bank that you can use on your phone or computer. 
- **Browse**: Find questions by subject (like Algorithms) or year.
- **Solve**: Try the Multiple Choice (MCQ), Multiple Select (MSQ), or Numerical (NAT) questions.
- **Calculator**: Use the built-in virtual calculator, which is exactly like the one provided in the actual GATE exam.
- **Offline Proof**: Once the site loads, you can solve questions even if your internet is slow, as everything is processed on your device.

### Key Features
- ✅ **Authentic UI**: Modeled after modern practice platforms.
- ✅ **TCS Calculator**: Identical to the GATE exam interface.
- ✅ **Progress Tracking**: Your bookmarks and solved status are saved in your browser.
- ✅ **Rich Content**: Supports mathematical formulas and code snippets (LaTeX rendering).

---

## 🛠️ Developer Quickstart

### Technical Details
Gate_QA is a **monorepo** consisting of a **React + Vite** frontend and a **Python** data pipeline. It is intentionally designed as a **serverless static site**, optimized for deployment on the GitHub Pages free tier.

#### 1. Setup Environment
```bash
# Clone the repo
git clone https://github.com/superawat/Gate_QA.git
cd Gate_QA

# Install Node dependencies
npm install

# Setup Python environment (for data pipeline)
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
```

#### 2. Local Development
```bash
# Start the Vite dev server
npm start
```
*Note: `npm start` automatically syncs calculator assets from `calculator/` to `public/calculator/`.*

#### 3. Build & Deploy
```bash
# Build for production
npm run build
```
This generates a `dist/` folder ready for static hosting. The build script ensures a `.nojekyll` file is created to support GitHub Pages pathing logic.

---

## 🏗️ How it Works (Architecture)

### "In Simple Terms"
The app is built like a three-step factory:
1. **The Scraper**: Goes out and collects questions from sources.
2. **The Pipeline**: Cleans the text, extracts answers from PDF keys using AI/OCR, and packages everything into small files.
3. **The Gallery (Frontend)**: A React app that displays these files beautifully on your screen.

### "Technical Details"
- **Frontend**: React 18, Vite, Tailwind CSS (for styling), and MathJax/KaTeX (for math).
- **Hosting**: GitHub Pages (Static).
- **No Backend**: All logic (filtering, searching, evaluation) happens client-side.
- **Storage**: Questions and answers are bundled into JSON files loaded via `fetch`.
- **States**: `localStorage` is used for persistent user data (bookmarks, attempts).

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full details.

---

## ⚙️ Data & Pipeline

The system processes data through several stages before it reaches the frontend:

1. **Scrape**: Python/Scrapy extracts questions from online databases.
2. **OCR Answers**: Extracts answer keys from scanned PDFs using `PaddleOCR` or `Tesseract`.
3. **Validate**: Ensures every question has a valid answer and type.
4. **Bundle**: Merges everything into `public/questions-with-answers.json`.

Detailed logs and intermediate reports are stored in `artifacts/review/`.

See [docs/DATA_PIPELINE.md](docs/DATA_PIPELINE.md) for data update workflows.

---

## ❓ FAQ & Troubleshooting

### 404 Errors on Sub-paths
Since this is a Single Page Application (SPA) on GitHub Pages, refreshing on a sub-route might cause a 404. We use a `.nojekyll` file and specific base-path routing in `vite.config.js` to mitigate this.

### Why is the OCR failing?
OCR depends on the quality of PDF scans. If parsing is poor:
1. Increase `--dpi` in the build script.
2. Update `data/answers/manual_answers_patch_v1.json` for persistent fixes.

---

## 🔒 Performance & Security

- **Performance**: We use memoization and client-side indexing to handle datasets with 1000+ questions smoothly on mobile.
- **Security**: All scraped HTML is sanitized before rendering to prevent XSS. We do not use any external APIs or tracking cookies.

---

## 📄 License & Attribution

## License

This project is open source. See [LICENSE](LICENSE) file for details.

For attribution requirements related to GATE Overflow content, 
see [docs/ATTRIBUTION.md](docs/ATTRIBUTION.md).

Data attribution: Questions scraped from GATE Overflow require proper attribution.
Code license: Up to you to specify in a separate LICENSE file.

---

*Built with ❤️ for GATE Aspirants.*
