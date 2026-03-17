const BASE_COLORS = { A: '#34d399', U: '#60a5fa', G: '#f59e0b', C: '#f472b6' };
const MOTIF_COLORS = {
  hairpin: '#f97316',
  internal_loop: '#ef4444',
  bulge: '#eab308',
  junction: '#a855f7',
  pseudoknot: '#fb7185',
};

export function createRenderer(canvas, hoverEl) {
  const ctx = canvas.getContext('2d');
  let state = null;
  let transform = { x: canvas.width / 2, y: canvas.height / 2, scale: 1 };
  let hovered = -1;
  let pinned = -1;
  let drag = null;
  let options = { showBackbone: true, showPairs: true, showLabels: false };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.floor(rect.width * window.devicePixelRatio);
    canvas.height = Math.floor(rect.height * window.devicePixelRatio);
    transform = { x: canvas.width / 2, y: canvas.height / 2, scale: window.devicePixelRatio };
    draw();
  };

  function setState(next) {
    state = next;
    hovered = -1;
    pinned = -1;
    draw();
  }

  function setOptions(next) {
    options = { ...options, ...next };
    draw();
  }

  function resetView() {
    transform = { x: canvas.width / 2, y: canvas.height / 2, scale: window.devicePixelRatio };
    draw();
  }

  function clearPin() {
    pinned = -1;
    draw();
  }

  function exportPng() {
    const link = document.createElement('a');
    link.download = 'rna-structure.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function screenToWorld(x, y) {
    return {
      x: (x * window.devicePixelRatio - transform.x) / transform.scale,
      y: (y * window.devicePixelRatio - transform.y) / transform.scale,
    };
  }

  function nearestIndex(world) {
    if (!state) return -1;
    let best = -1;
    let bestD = 12;
    state.layout.forEach((p, i) => {
      const d = Math.hypot(p.x - world.x, p.y - world.y);
      if (d < bestD) {
        best = i;
        bestD = d;
      }
    });
    return best;
  }

  function drawMotifHalos(activeIndex) {
    if (!state?.motifs?.length) return;
    for (const motif of state.motifs) {
      const color = MOTIF_COLORS[motif.type] ?? '#94a3b8';
      const highlight = activeIndex >= 0 && motif.bases.includes(activeIndex);
      ctx.strokeStyle = highlight ? '#ffffff' : color;
      ctx.lineWidth = (highlight ? 2.6 : 1.1) / transform.scale;
      for (const idx of motif.bases) {
        const p = state.layout[idx];
        if (!p) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, highlight ? 9 : 7.3, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state) return;

    const activeIndex = pinned >= 0 ? pinned : hovered;

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    const pairMap = new Map();
    state.pairs.forEach(([i, j]) => {
      pairMap.set(i, j);
      pairMap.set(j, i);
    });

    if (options.showBackbone) {
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1.3 / transform.scale;
      ctx.beginPath();
      state.layout.forEach((p, i) => {
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
    }

    if (options.showPairs) {
      for (const [i, j] of state.pairs) {
        const a = state.layout[i];
        const b = state.layout[j];
        const midX = (a.x + b.x) / 2;
        const midY = (a.y + b.y) / 2;
        const span = Math.abs(i - j);
        const curvature = Math.min(0.55, 0.16 + span / Math.max(state.sequence.length, 1));
        const ctrlX = midX * (1 - curvature);
        const ctrlY = midY * (1 - curvature);
        const isActivePair = i === activeIndex || j === activeIndex;

        ctx.strokeStyle = isActivePair ? '#a5f3fc' : `rgba(34, 211, 238, ${Math.min(0.9, 0.25 + span / state.sequence.length)})`;
        ctx.lineWidth = (isActivePair ? 2.8 : 1.5) / transform.scale;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(ctrlX, ctrlY, b.x, b.y);
        ctx.stroke();
      }
    }

    drawMotifHalos(activeIndex);

    for (let i = 0; i < state.sequence.length; i += 1) {
      const p = state.layout[i];
      const base = state.sequence[i];
      const isActive = i === activeIndex || pairMap.get(i) === activeIndex;
      const isPaired = pairMap.has(i);

      ctx.fillStyle = isActive ? '#ffffff' : BASE_COLORS[base] ?? '#cbd5e1';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isActive ? 6.2 : 4.5, 0, Math.PI * 2);
      ctx.fill();

      if (!isPaired) {
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1 / transform.scale;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6.8, 0, Math.PI * 2);
        ctx.stroke();
      }

      if (options.showLabels && (state.sequence.length <= 120 || isActive)) {
        ctx.fillStyle = '#cbd5e1';
        ctx.font = `${12 / transform.scale}px system-ui`;
        ctx.fillText(`${base}${i}`, p.x + 8 / transform.scale, p.y - 8 / transform.scale);
      }
    }

    ctx.restore();

    if (activeIndex >= 0) {
      const partner = pairMap.get(activeIndex);
      const distance = partner !== undefined ? Math.abs(partner - activeIndex) : 0;
      const motifTypes = state.motifByIndex?.get(activeIndex) ?? [];
      const motifSuffix = motifTypes.length ? ` | motifs: ${motifTypes.join(', ')}` : '';
      hoverEl.textContent = `Index ${activeIndex} (${state.sequence[activeIndex]})` +
        (partner !== undefined
          ? ` pairs with ${partner} (${state.sequence[partner]}), span ${distance}`
          : ' is unpaired') + motifSuffix;
    } else {
      hoverEl.textContent = 'Hover a base to inspect pairing and motifs. Click to pin.';
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const next = nearestIndex(world);
    if (pinned < 0 && next !== hovered) {
      hovered = next;
      draw();
    }
    if (drag) {
      const dx = (e.clientX - drag.x) * window.devicePixelRatio;
      const dy = (e.clientY - drag.y) * window.devicePixelRatio;
      transform.x += dx;
      transform.y += dy;
      drag = { x: e.clientX, y: e.clientY };
      draw();
    }
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    pinned = nearestIndex(world);
    draw();
  });

  canvas.addEventListener('mousedown', (e) => {
    drag = { x: e.clientX, y: e.clientY };
  });

  window.addEventListener('mouseup', () => {
    drag = null;
  });

  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.1 : 0.9;
    transform.scale = Math.min(8, Math.max(0.3, transform.scale * factor));
    draw();
  }, { passive: false });

  window.addEventListener('resize', resize);
  resize();

  return { setState, setOptions, resetView, clearPin, exportPng };
}
