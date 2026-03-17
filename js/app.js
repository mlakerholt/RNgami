import { normalizeSequence, validateSequence, nussinovFold, toDotBracket } from './folding.js';
import { circularLayout } from './layout.js';
import { createRenderer } from './render.js';
import { summarizeMotifs } from './motifs.js';
import { RNA_EXAMPLES, getExampleById } from './examples.js';

const APP_VERSION = 'v0.2.0';

const els = {
  sequence: document.getElementById('sequence'),
  allowWobble: document.getElementById('allowWobble'),
  minLoopLength: document.getElementById('minLoopLength'),
  showBackbone: document.getElementById('showBackbone'),
  showPairs: document.getElementById('showPairs'),
  showLabels: document.getElementById('showLabels'),
  predictBtn: document.getElementById('predictBtn'),
  loadExampleBtn: document.getElementById('loadExampleBtn'),
  resetViewBtn: document.getElementById('resetViewBtn'),
  clearPinBtn: document.getElementById('clearPinBtn'),
  exportPngBtn: document.getElementById('exportPngBtn'),
  exampleSelect: document.getElementById('exampleSelect'),
  exampleNote: document.getElementById('exampleNote'),
  error: document.getElementById('error'),
  dotBracket: document.getElementById('dotBracket'),
  lengthOut: document.getElementById('lengthOut'),
  pairsOut: document.getElementById('pairsOut'),
  scoreOut: document.getElementById('scoreOut'),
  runtimeOut: document.getElementById('runtimeOut'),
  stemsOut: document.getElementById('stemsOut'),
  hairpinsOut: document.getElementById('hairpinsOut'),
  internalLoopsOut: document.getElementById('internalLoopsOut'),
  bulgesOut: document.getElementById('bulgesOut'),
  junctionsOut: document.getElementById('junctionsOut'),
  knotCrossingsOut: document.getElementById('knotCrossingsOut'),
  hoverInfo: document.getElementById('hoverInfo'),
  canvas: document.getElementById('rnaCanvas'),
  appVersion: document.getElementById('appVersion'),
};

const renderer = createRenderer(els.canvas, els.hoverInfo);
els.appVersion.textContent = APP_VERSION;

function setError(msg = '') {
  els.error.textContent = msg;
}

function syncRenderOptions() {
  renderer.setOptions({
    showBackbone: els.showBackbone.checked,
    showPairs: els.showPairs.checked,
    showLabels: els.showLabels.checked,
  });
}


function updateMotifSummary(summary) {
  els.stemsOut.textContent = String(summary.stems);
  els.hairpinsOut.textContent = String(summary.hairpins);
  els.internalLoopsOut.textContent = String(summary.internalLoops);
  els.bulgesOut.textContent = String(summary.bulges);
  els.junctionsOut.textContent = String(summary.junctions);
  els.knotCrossingsOut.textContent = String(summary.pseudoknotCrossings);
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
  const motifSummary = summarizeMotifs(sequence, pairs);
  const layout = circularLayout(sequence.length, Math.min(320, 130 + sequence.length * 1.4));

  renderer.setState({ sequence, pairs, layout });
  syncRenderOptions();
  updateMetrics({ length: sequence.length, pairs: pairs.length, score, runtimeMs, dotBracket });
  updateMotifSummary(motifSummary);
}

function populateExamples() {
  RNA_EXAMPLES.forEach((ex) => {
    const option = document.createElement('option');
    option.value = ex.id;
    option.textContent = ex.label;
    els.exampleSelect.append(option);
  });
}

function loadSelectedExample() {
  const selected = getExampleById(els.exampleSelect.value);
  els.sequence.value = selected.sequence;
  els.exampleNote.textContent = selected.note;
  predict();
}

els.predictBtn.addEventListener('click', predict);
els.loadExampleBtn.addEventListener('click', loadSelectedExample);
els.resetViewBtn.addEventListener('click', () => renderer.resetView());
els.clearPinBtn.addEventListener('click', () => renderer.clearPin());
els.exportPngBtn.addEventListener('click', () => renderer.exportPng());

[els.showBackbone, els.showPairs, els.showLabels].forEach((control) => {
  control.addEventListener('change', syncRenderOptions);
});

els.exampleSelect.addEventListener('change', () => {
  const selected = getExampleById(els.exampleSelect.value);
  els.exampleNote.textContent = selected.note;
});

populateExamples();
els.exampleSelect.value = RNA_EXAMPLES[0].id;
loadSelectedExample();
