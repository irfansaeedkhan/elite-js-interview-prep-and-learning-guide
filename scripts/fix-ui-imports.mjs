import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const dir = 'src/components/ui';

function walk(d) {
  for (const name of readdirSync(d)) {
    const p = join(d, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.tsx?$/.test(name)) {
      let s = readFileSync(p, 'utf8');
      s = s.replace(/from\s+(['"])([^'"]+)@[^'"]+\1/g, 'from $1$2$1');
      s = s.replace(/import\s+(['"])([^'"]+)@[^'"]+\1/g, 'import $1$2$1');
      writeFileSync(p, s);
    }
  }
}

walk(dir);
console.log('Fixed UI imports');
