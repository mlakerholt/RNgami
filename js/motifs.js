/**
 * @typedef {'hairpin'|'internal_loop'|'bulge'|'junction'|'pseudoknot'} MotifType
 */

/** @param {Array<[number, number]>} pairs */
export function buildPairMap(pairs) {
  const pairMap = new Map();
  for (const [i, j] of pairs) {
    pairMap.set(i, j);
    pairMap.set(j, i);
  }
  return pairMap;
}

/** @param {Array<[number, number]>} pairs */
export function countCrossingPairs(pairs) {
  let crossings = 0;
  for (let a = 0; a < pairs.length; a += 1) {
    const [i, j] = pairs[a];
    for (let b = a + 1; b < pairs.length; b += 1) {
      const [k, l] = pairs[b];
      if ((i < k && k < j && j < l) || (k < i && i < l && l < j)) crossings += 1;
    }
  }
  return crossings;
}

function enclosedPairCount(pairs, i, j) {
  let count = 0;
  for (const [a, b] of pairs) {
    if (i < a && b < j) count += 1;
  }
  return count;
}

function classifyGapMotifs(stems) {
  const motifs = [];
  for (const stem of stems) {
    for (let idx = 0; idx + 1 < stem.length; idx += 1) {
      const [i, j] = stem[idx];
      const [ni, nj] = stem[idx + 1];
      const leftGap = ni - i - 1;
      const rightGap = j - nj - 1;
      if (leftGap <= 0 && rightGap <= 0) continue;

      const bases = [];
      for (let a = i + 1; a < ni; a += 1) bases.push(a);
      for (let b = nj + 1; b < j; b += 1) bases.push(b);

      if (leftGap > 0 && rightGap > 0) {
        motifs.push({ type: 'internal_loop', bases, span: [i, j], size: leftGap + rightGap });
      } else {
        motifs.push({ type: 'bulge', bases, span: [i, j], size: leftGap + rightGap });
      }
    }
  }
  return motifs;
}

/**
 * Build contiguous stems from sorted pairs.
 * @param {Array<[number, number]>} pairs
 */
export function buildStems(pairs) {
  const sorted = [...pairs].sort((a, b) => a[0] - b[0]);
  const stems = [];
  let current = [];

  for (const pair of sorted) {
    if (current.length === 0) {
      current.push(pair);
      continue;
    }
    const [pi, pj] = current[current.length - 1];
    const [i, j] = pair;
    if (i === pi + 1 && j === pj - 1) {
      current.push(pair);
    } else {
      stems.push(current);
      current = [pair];
    }
  }
  if (current.length) stems.push(current);
  return stems;
}

/**
 * Full auto motif analysis from predicted base pairs.
 * @param {string} sequence
 * @param {Array<[number, number]>} pairs
 */
export function analyzeStructure(sequence, pairs) {
  const pairMap = buildPairMap(pairs);
  const stems = buildStems(pairs);

  /** @type {Array<{type: MotifType, bases:number[], span:[number,number], size:number}>} */
  const motifs = [];

  // Hairpins and junction-like enclosures.
  for (const [i, j] of pairs) {
    const innerCount = enclosedPairCount(pairs, i, j);
    if (innerCount === 0) {
      const bases = [];
      for (let k = i + 1; k < j; k += 1) if (!pairMap.has(k)) bases.push(k);
      motifs.push({ type: 'hairpin', bases, span: [i, j], size: bases.length });
    } else if (innerCount >= 2) {
      motifs.push({ type: 'junction', bases: [i, j], span: [i, j], size: innerCount });
    }
  }

  motifs.push(...classifyGapMotifs(stems));

  const pseudoknotCrossings = countCrossingPairs(pairs);
  if (pseudoknotCrossings > 0) {
    motifs.push({
      type: 'pseudoknot',
      bases: [...new Set(pairs.flat())],
      span: [0, Math.max(0, sequence.length - 1)],
      size: pseudoknotCrossings,
    });
  }

  const motifByIndex = new Map();
  motifs.forEach((motif) => {
    for (const index of motif.bases) {
      if (!motifByIndex.has(index)) motifByIndex.set(index, []);
      motifByIndex.get(index).push(motif.type);
    }
  });

  const summary = {
    stems: stems.length,
    hairpins: motifs.filter((m) => m.type === 'hairpin').length,
    internalLoops: motifs.filter((m) => m.type === 'internal_loop').length,
    bulges: motifs.filter((m) => m.type === 'bulge').length,
    junctions: motifs.filter((m) => m.type === 'junction').length,
    pseudoknotCrossings,
  };

  return { summary, motifs, motifByIndex, stems, pairMap };
}

export function summarizeMotifs(sequence, pairs) {
  return analyzeStructure(sequence, pairs).summary;
}
