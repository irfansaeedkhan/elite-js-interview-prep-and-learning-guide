#!/usr/bin/env node
/** Add prerequisite chain to original 10 MVP topics */
import fs from 'node:fs';
import path from 'node:path';

const patches = [
  ['data-types/numbers.mdx', ['strings']],
  ['data-types/objects.mdx', ['numbers']],
  ['data-types/arrays.mdx', ['objects']],
  ['foundation/hoisting.mdx', ['arrays']],
  ['foundation/this-keyword.mdx', ['closures']],
  ['foundation/prototypes.mdx', ['this-keyword']],
  ['execution/event-loop.mdx', ['prototypes']],
];

const ROOT = path.join(process.cwd(), 'content/tracks/javascript');

for (const [rel, prereqs] of patches) {
  const file = path.join(ROOT, rel);
  let text = fs.readFileSync(file, 'utf8');
  if (text.includes('prerequisites:')) {
    console.log('skip (has prerequisites)', rel);
    continue;
  }
  const block = `prerequisites:\n${prereqs.map((p) => `  - ${p}`).join('\n')}\n`;
  text = text.replace(/^(estimatedMinutes: \d+\n)/m, `$1${block}`);
  fs.writeFileSync(file, text);
  console.log('patched', rel);
}

console.log('Done.');
