import { normalizeSequence, validateSequence, nussinovFold, toDotBracket } from './folding.js';
import { circularLayout } from './layout.js';
import { createRenderer } from './render.js';

const els = {
  sequence: document.getElementById('sequence'),
  allowWobble: document.getElementById('allowWobble'),
  minLoopLength: document.getElementById('minLoopLength'),
  predictBtn: document.getElementById('predictBtn'),
  exampleBtn: document.getElementById('exampleBtn'),
  resetViewBtn: document.getElementById('resetViewBtn'),
  error: document.getElementById('error'),
  dotBracket: document.getElementById('dotBracket'),
  lengthOut: document.getElementById('lengthOut'),
  pairsOut: document.getElementById('pairsOut'),
  scoreOut: document.getElementById('scoreOut'),
  runtimeOut: document.getElementById('runtimeOut'),
  hoverInfo: document.getElementById('hoverInfo'),
  canvas: document.getElementById('rnaCanvas'),
};

const renderer = createRenderer(els.canvas, els.hoverInfo);

function setError(msg = '') {
  els.error.textContent = msg;
}

function updateMetrics({ length, pairs, score, runtimeMs, dotBracket }) {
  els.lengthOut.textContent = String(length);
  els.pairsOut.textContent = String(pairs);
  els.scoreOut.textContent = String(score);
  els.runtimeOut.textContent = `${runtimeMs.toFixed(1)} ms`;
  els.dotBracket.value = dotBracket;
}

function predict() {
  setError('');
  const sequence = normalizeSequence(els.sequence.value);
  const error = validateSequence(sequence);
  if (error) {
    setError(error);
    return;
  }

  if (sequence.length > 600) {
    setError('Warning: very long input may be slow in-browser.');
  }

  const options = {
    allowWobble: els.allowWobble.checked,
    minLoopLength: Number(els.minLoopLength.value) || 0,
  };

  const t0 = performance.now();
  const { pairs, score } = nussinovFold(sequence, options);
  const runtimeMs = performance.now() - t0;
  const dotBracket = toDotBracket(sequence.length, pairs);
  const layout = circularLayout(sequence.length, Math.min(320, 130 + sequence.length * 1.4));

  renderer.setState({ sequence, pairs, layout });
  updateMetrics({ length: sequence.length, pairs: pairs.length, score, runtimeMs, dotBracket });
}

els.predictBtn.addEventListener('click', predict);
els.exampleBtn.addEventListener('click', () => {
  els.sequence.value = 'GGGAAAUCCCUUAGGCUAACCGGAUUUCCCG';
  predict();
});
els.resetViewBtn.addEventListener('click', () => renderer.resetView());

els.sequence.value = 'GGGAUCC';
predict();
