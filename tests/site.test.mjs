// Static portfolio invariants. Run with: node --test tests/site.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
test('unique IDs and valid same-page anchors', () => {
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(x => x[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const [, target] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(target), 'Missing anchor #' + target);
  for (const [, targets] of html.matchAll(/aria-labelledby="([^"]+)"/g)) for (const id of targets.split(/\s+/)) assert(ids.includes(id), 'Missing aria label ' + id);
});
test('disclosures balanced and critical sections preserved', () => {
  assert.equal((html.match(/<details\b/g)||[]).length,(html.match(/<\/details>/g)||[]).length);
  for (const target of ['id="work"','id="experience"','id="contact"','id="salesforce-campaigns"','id="ai-reply-workflow"','id="web-publishing"','id="operations-training"','id="events-training"','id="content-production"','id="reply-demo"']) assert(html.includes(target), 'Missing ' + target);
});
test('confirmed claim guards', () => {
  assert.match(html,/50\+ Engagement Studio workflows/);
  assert.match(html,/500\+ in-person leads/);
  const th=html.match(/<h3>Digital Marketer<\/h3>[\s\S]*?<\/article>/)?.[0]??'';
  assert(th,'Travel Hotline section missing');
  assert(!/blog|wordpress|elementor|website/i.test(th),'Travel Hotline misattribution');
  assert(!html.includes('project-preview'), 'Duplicate preview navigation');
  assert(html.includes('Illustrative simulation'));
  assert(html.includes('500+ in-person leads'));
  assert(html.includes('trained four teammates'));
  assert(!html.includes('One CEO responded'));
  assert(html.includes('total contract value (TCV)'));
  assert(html.includes('id="acquisition-example"'));
  assert(html.includes('value="unclear"'));
  assert(html.includes('trained two GRM coworkers'));
});
test('local assets exist', () => {
  for(const file of ['styles.css','clarity.css','script.js','clarity.js','privacy.html','Michael_Steurer_Resume.pdf','michael-steurer-portrait.webp']) assert(existsSync(new URL('../'+file,import.meta.url)), 'Missing asset ' + file);
});
