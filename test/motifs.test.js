import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeStructure, countCrossingPairs } from '../js/motifs.js';

test('detect crossing pairs for pseudoknot-like topology', () => {
  const pairs = [[0, 6], [2, 8], [3, 5]];
  assert.equal(countCrossingPairs(pairs), 1);
});

test('auto structure analysis provides motif summary and mappings', () => {
  const sequence = 'GGGAAAUCC';
  const pairs = [[0, 8], [1, 7]];
  const analysis = analyzeStructure(sequence, pairs);

  assert.ok(analysis.summary.stems >= 1);
  assert.ok(Array.isArray(analysis.motifs));
  assert.ok(analysis.motifByIndex instanceof Map);
  assert.ok(analysis.summary.hairpins >= 1);
  assert.ok(analysis.summary.pseudoknotCrossings >= 0);
});
