import test from 'node:test';
import assert from 'node:assert/strict';
import { canPair, nussinovFold, toDotBracket, normalizeSequence, validateSequence } from '../js/folding.js';

test('normalize and validate sequence', () => {
  const normalized = normalizeSequence('augc tT');
  assert.equal(normalized, 'AUGCUU');
  assert.equal(validateSequence(normalized), null);
  assert.equal(validateSequence('AUGX'), 'Only A, U, G, C are allowed.');
});

test('pairing rules support canonical and wobble', () => {
  assert.equal(canPair('A', 'U'), true);
  assert.equal(canPair('G', 'C'), true);
  assert.equal(canPair('G', 'U', false), false);
  assert.equal(canPair('G', 'U', true), true);
});

test('nussinov returns stable pairs and dot-bracket', () => {
  const sequence = 'GGGAUCC';
  const { pairs, score } = nussinovFold(sequence, { allowWobble: true, minLoopLength: 0 });
  assert.equal(score, pairs.length);
  const db = toDotBracket(sequence.length, pairs);
  assert.equal(db.length, sequence.length);
  assert.match(db, /^[().]+$/);
});
