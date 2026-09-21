const fs = require('fs');
const path = require('path');

const replacements = {
  'brand-primary': 'emerald-600',
  'brand-secondary': 'emerald-50',
  'brand-accent': 'emerald-200',
  'brand-dark': 'slate-800',
  'brand-light': 'slate-50',
  'brand-text': 'slate-500'
};

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;
      for (const [oldClass, newClass] of Object.entries(replacements)) {
        if (content.includes(oldClass)) {
          content = content.replace(new RegExp(oldClass, 'g'), newClass);
          changed = true;
        }
      }
      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

processDir('./src/app/dashboard');
processDir('./src/components/ui');
