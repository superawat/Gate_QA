const fs = require('fs');
const path = require('path');

function checkImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            checkImports(fullPath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx')) {
            const content = fs.readFileSync(fullPath, 'utf8');
            const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
            let match;
            while ((match = importRegex.exec(content)) !== null) {
                const importPath = match[1];
                if (importPath.startsWith('.')) {
                    // It's a local import
                    const resolvedPath = path.resolve(dir, importPath);
                    // Check if it exists with exact case
                    const baseDir = path.dirname(resolvedPath);
                    const baseName = path.basename(resolvedPath);
                    if (fs.existsSync(baseDir)) {
                        const dirEntries = fs.readdirSync(baseDir);
                        // find a matching entry ignoring extension if not provided
                        let found = false;
                        for (const entry of dirEntries) {
                           const entryNoExt = entry.replace(/\.[^/.]+$/, "");
                           if (entry === baseName || entryNoExt === baseName) {
                               found = true;
                               break;
                           }
                        }
                        if (!found && fs.existsSync(resolvedPath)) {
                            console.error(`Case mismatch in ${fullPath}: imported '${importPath}'`);
                        }
                    } else {
                        // ignore broken imports here, we just want case mismatches
                    }
                }
            }
        }
    }
}

checkImports(path.join(__dirname, 'src'));
console.log('Case check complete.');
