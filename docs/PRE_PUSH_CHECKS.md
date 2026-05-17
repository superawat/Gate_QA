# Pre-Push Quality Checks

To ensure that the main branch remains stable and free of regressions, a comprehensive suite of checks must be run before any code is pushed to GitHub.

## The Checklist

The following commands represent the complete CI pipeline that GitHub Actions will run. Running them locally ensures your PRs/commits pass cleanly.

1. **Unit Tests:** `npm run test:unit`
2. **Data Integrity Validation:** `npm run qa:validate-data`
3. **Production Build:** `npm run build` (Must succeed before E2E tests can run)
4. **End-to-End Tests:** `npm run test:e2e`
5. **Accessibility Audit:** `npm run qa:a11y:axe` (Also included in E2E, but can be run standalone)
6. **Bundle Size Budget:** `npm run qa:validate-bundle-budget`
7. **Landing Network Optimization:** `npm run qa:validate-landing-network`
8. **Lighthouse Mobile Performance:** `npm run lighthouse:mobile`
9. **Public Artifact Parity:** `npm run qa:validate-public-parity`

---

## 🚀 Run Everything Automatically

You can run all of these checks in sequence with a single command. 

If you are using **Git Bash / Linux / macOS**, run:
```bash
npm run test:unit && \
npm run qa:validate-data && \
npm run build && \
npm run test:e2e && \
npm run qa:validate-bundle-budget && \
npm run qa:validate-landing-network && \
npm run lighthouse:mobile && \
npm run qa:validate-public-parity
```

If you are using **Windows PowerShell**, run:
```powershell
npm run test:unit ; if ($?) { npm run qa:validate-data } ; if ($?) { npm run build } ; if ($?) { npm run test:e2e } ; if ($?) { npm run qa:validate-bundle-budget } ; if ($?) { npm run qa:validate-landing-network } ; if ($?) { npm run lighthouse:mobile } ; if ($?) { npm run qa:validate-public-parity }
```

## Adding as a Git Hook (Optional)

If you want Git to automatically prevent you from pushing broken code, you can create a pre-push hook:

1. Create a file at `.git/hooks/pre-push`
2. Paste the following bash script into it:

```bash
#!/bin/sh
echo "Running Pre-Push Checks..."

npm run test:unit && \
npm run qa:validate-data && \
npm run build && \
npm run test:e2e && \
npm run qa:validate-bundle-budget && \
npm run qa:validate-landing-network && \
npm run lighthouse:mobile && \
npm run qa:validate-public-parity

if [ $? -ne 0 ]; then
  echo "❌ Pre-push checks failed. Please fix the errors before pushing."
  exit 1
fi

echo "✅ All checks passed! Pushing to GitHub..."
exit 0
```
3. Make it executable: `chmod +x .git/hooks/pre-push`
