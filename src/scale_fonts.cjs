const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.jsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      const newContent = content.replace(/(fontSize|padding|gap):\s*(['"`]?)(\d+)px\2/g, (match, prop, quote, val) => {
        changed = true;
        let num = parseInt(val);
        let newNum = Math.round(num * 1.3);
        let q = quote || "'";
        return `${prop}: ${q}${newNum}px${q}`;
      });

      if (changed) {
        fs.writeFileSync(fullPath, newContent);
      }
    }
  }
}
processDir('components');
