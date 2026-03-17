import test from 'node:test';
import assert from 'node:assert/strict';
import { RNA_EXAMPLES, getExampleById } from '../js/examples.js';

test('examples are present and valid RNA sequences', () => {
  assert.ok(RNA_EXAMPLES.length >= 4);
  for (const example of RNA_EXAMPLES) {
    assert.match(example.sequence, /^[AUGC]+$/);
    assert.ok(example.note.length > 10);
  }
});

test('getExampleById returns fallback for unknown id', () => {
  const fallback = getExampleById('missing-id');
  assert.equal(fallback.id, RNA_EXAMPLES[0].id);
});
