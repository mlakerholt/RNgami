/**
 * @typedef {'hairpin'|'internal_loop'|'bulge'|'junction'|'external'|'pseudoknot'} MotifType
 */

/**
 * Build quick lookup maps from pair tuples.
 * @param {Array<[number, number]>} pairs
 */
function buildPairMaps(pairs) {
  const pairMap = new Map();
  const startSet = new Set();
  for (const [i, j] of pairs) {
    pairMap.set(i, j);
    pairMap.set(j, i);
    startSet.add(i);
  }
  return { pairMap, startSet };
}

/**
 * Detect crossing base-pair interactions (pseudoknot signature).
 * @param {Array<[number, number]>} pairs
 */
export function countCrossingPairs(pairs) {
  let crossings = 0;
  for (let a = 0; a < pairs.length; a += 1) {
    const [i, j] = pairs[a];
    for (let b = a + 1; b < pairs.length; b += 1) {
      const [k, l] = pairs[b];
      if ((i < k && k < j && j < l) || (k < i && i < l && l < j)) {
        crossings += 1;
      }
    }
  }
  return crossings;
}

/**
 * Classify broad motif buckets from pair topology.
 * This is a kickoff-level motif pass designed for UI summaries.
 * @param {string} sequence
 * @param {Array<[number, number]>} pairs
 */
export function summarizeMotifs(sequence, pairs) {
  const n = sequence.length;
  const { pairMap, startSet } = buildPairMaps(pairs);

  const summary = {
    stems: 0,
    hairpins: 0,
    internalLoops: 0,
    bulges: 0,
    junctions: 0,
    externalUnpaired: 0,
    pseudoknotCrossings: countCrossingPairs(pairs),
  };

  // Count stems as contiguous helix runs.
  for (const [i, j] of pairs) {
    if (!pairMap.has(i - 1) || pairMap.get(i - 1) !== j + 1) {
      summary.stems += 1;
    }
  }

  // Classify enclosed regions by pair adjacency.
  for (const [i, j] of pairs) {
    if (!startSet.has(i)) continue;

    const nextI = i + 1;
    const nextJ = j - 1;
    const hasInnerPair = pairMap.has(nextI) && pairMap.get(nextI) === nextJ;

    if (!hasInnerPair) {
      // terminal enclosure -> hairpin-ish loop
      const innerPairs = pairs.filter(([a, b]) => i < a && b < j).length;
      if (innerPairs === 0) summary.hairpins += 1;
      else summary.junctions += 1;
      continue;
    }

    // inspect asymmetry between paired ladder steps for bulge/internal loop.
    let left = nextI;
    let right = nextJ;
    while (left < right && pairMap.has(left) && pairMap.get(left) === right) {
      left += 1;
      right -= 1;
    }
    if (left >= right) continue;

    const leftUnpaired = Number(!pairMap.has(left));
    const rightUnpaired = Number(!pairMap.has(right));

    if (leftUnpaired + rightUnpaired === 1) summary.bulges += 1;
    if (leftUnpaired + rightUnpaired === 2) summary.internalLoops += 1;
  }

  for (let idx = 0; idx < n; idx += 1) {
    if (!pairMap.has(idx)) summary.externalUnpaired += 1;
  }

  return summary;
}
