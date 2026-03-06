const fs = require('fs');
const path = require('path');

function replaceInDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) replaceInDir(full);
    else if (e.name.endsWith('.json')) {
      let s = fs.readFileSync(full, 'utf8');
      if (s.includes('"type": "token"')) {
        s = s.replace(/"type": "token"/g, '"type": "textmate token"');
        fs.writeFileSync(full, s);
        console.log('Updated', full);
      }
    }
  }
}

replaceInDir(path.join(__dirname, '..', 'data'));
