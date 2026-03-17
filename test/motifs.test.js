import test from 'node:test';
import assert from 'node:assert/strict';
import { countCrossingPairs, summarizeMotifs } from '../js/motifs.js';

test('detect crossing pairs for pseudoknot-like topology', () => {
  const pairs = [[0, 6], [2, 8], [3, 5]];
  assert.equal(countCrossingPairs(pairs), 1);
});

test('summarize motifs returns expected keys and non-negative counts', () => {
  const sequence = 'GGGAAAUCC';
  const pairs = [[0, 8], [1, 7]];
  const summary = summarizeMotifs(sequence, pairs);
  assert.ok(summary.stems >= 1);
  assert.ok(summary.hairpins >= 0);
  assert.ok(summary.internalLoops >= 0);
  assert.ok(summary.bulges >= 0);
  assert.ok(summary.junctions >= 0);
  assert.ok(summary.pseudoknotCrossings >= 0);
});
