export function normalizeSequence(input) {
  return input.toUpperCase().replace(/\s+/g, '').replace(/T/g, 'U');
}

export function validateSequence(sequence) {
  if (!sequence.length) return 'Sequence is empty.';
  if (!/^[AUGC]+$/.test(sequence)) return 'Only A, U, G, C are allowed.';
  return null;
}

export function canPair(a, b, allowWobble = true) {
  if ((a === 'A' && b === 'U') || (a === 'U' && b === 'A')) return true;
  if ((a === 'G' && b === 'C') || (a === 'C' && b === 'G')) return true;
  if (allowWobble && ((a === 'G' && b === 'U') || (a === 'U' && b === 'G'))) return true;
  return false;
}

export function nussinovFold(sequence, { allowWobble = true, minLoopLength = 3 } = {}) {
  const n = sequence.length;
  const dp = Array.from({ length: n }, () => new Int16Array(n));

  for (let l = 1; l < n; l += 1) {
    for (let i = 0; i + l < n; i += 1) {
      const j = i + l;
      let best = Math.max(dp[i + 1]?.[j] ?? 0, dp[i][j - 1] ?? 0);

      if (j - i > minLoopLength && canPair(sequence[i], sequence[j], allowWobble)) {
        best = Math.max(best, (dp[i + 1]?.[j - 1] ?? 0) + 1);
      }

      for (let k = i + 1; k < j; k += 1) {
        best = Math.max(best, dp[i][k] + dp[k + 1][j]);
      }
      dp[i][j] = best;
    }
  }

  const pairs = [];
  traceback(sequence, dp, 0, n - 1, pairs, allowWobble, minLoopLength);
  pairs.sort((a, b) => a[0] - b[0]);
  return { pairs, score: n > 0 ? dp[0][n - 1] : 0 };
}

function traceback(sequence, dp, i, j, pairs, allowWobble, minLoopLength) {
  if (i >= j) return;

  if (dp[i][j] === (dp[i + 1]?.[j] ?? 0)) {
    traceback(sequence, dp, i + 1, j, pairs, allowWobble, minLoopLength);
    return;
  }

  if (dp[i][j] === (dp[i][j - 1] ?? 0)) {
    traceback(sequence, dp, i, j - 1, pairs, allowWobble, minLoopLength);
    return;
  }

  if (
    j - i > minLoopLength &&
    canPair(sequence[i], sequence[j], allowWobble) &&
    dp[i][j] === (dp[i + 1]?.[j - 1] ?? 0) + 1
  ) {
    pairs.push([i, j]);
    traceback(sequence, dp, i + 1, j - 1, pairs, allowWobble, minLoopLength);
    return;
  }

  for (let k = i + 1; k < j; k += 1) {
    if (dp[i][j] === dp[i][k] + dp[k + 1][j]) {
      traceback(sequence, dp, i, k, pairs, allowWobble, minLoopLength);
      traceback(sequence, dp, k + 1, j, pairs, allowWobble, minLoopLength);
      return;
    }
  }
}

export function toDotBracket(length, pairs) {
  const chars = Array.from({ length }, () => '.');
  for (const [i, j] of pairs) {
    chars[i] = '(';
    chars[j] = ')';
  }
  return chars.join('');
}
