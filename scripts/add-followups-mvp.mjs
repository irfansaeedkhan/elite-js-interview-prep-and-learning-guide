#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const files = [
  'data-types/strings.mdx',
  'data-types/numbers.mdx',
  'data-types/objects.mdx',
  'data-types/arrays.mdx',
  'foundation/hoisting.mdx',
  'foundation/closures.mdx',
  'foundation/this-keyword.mdx',
  'foundation/prototypes.mdx',
  'execution/event-loop.mdx',
  'execution/promises.mdx',
];

const ROOT = path.join(process.cwd(), 'content/tracks/javascript');
const followUp = `    followUps:
      - Can you walk through a concrete example?
      - What would break if you got this wrong in production?`;

for (const rel of files) {
  const file = path.join(ROOT, rel);
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes('followUps:')) {
    console.log('skip', rel);
    continue;
  }
  text = text.replace(
    /(    difficulty: (?:easy|medium|hard)\n)(?=  - id: |---)/g,
    `$1${followUp}\n`,
  );
  fs.writeFileSync(file, text);
  console.log('patched', rel);
}
