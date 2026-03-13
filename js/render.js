const BASE_COLORS = { A: '#34d399', U: '#60a5fa', G: '#f59e0b', C: '#f472b6' };

export function createRenderer(canvas, hoverEl) {
  const ctx = canvas.getContext('2d');
  let state = null;
  let transform = { x: canvas.width / 2, y: canvas.height / 2, scale: 1 };
  let hovered = -1;
  let drag = null;

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
    draw();
  }

  function resetView() {
    transform = { x: canvas.width / 2, y: canvas.height / 2, scale: window.devicePixelRatio };
    draw();
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

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!state) return;

    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.scale, transform.scale);

    // backbone
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.4 / transform.scale;
    ctx.beginPath();
    state.layout.forEach((p, i) => {
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    });
    ctx.stroke();

    // pairs
    ctx.strokeStyle = '#22d3ee';
    ctx.lineWidth = 1.8 / transform.scale;
    for (const [i, j] of state.pairs) {
      ctx.beginPath();
      ctx.moveTo(state.layout[i].x, state.layout[i].y);
      ctx.lineTo(state.layout[j].x, state.layout[j].y);
      ctx.stroke();
    }

    const pairMap = new Map();
    state.pairs.forEach(([i, j]) => {
      pairMap.set(i, j);
      pairMap.set(j, i);
    });

    for (let i = 0; i < state.sequence.length; i += 1) {
      const p = state.layout[i];
      const base = state.sequence[i];
      const isHovered = i === hovered || pairMap.get(i) === hovered;

      ctx.fillStyle = isHovered ? '#ffffff' : BASE_COLORS[base] ?? '#cbd5e1';
      ctx.beginPath();
      ctx.arc(p.x, p.y, isHovered ? 6 : 4.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    if (hovered >= 0) {
      const partner = pairMap.get(hovered);
      hoverEl.textContent = `Index ${hovered} (${state.sequence[hovered]})` +
        (partner !== undefined ? ` pairs with ${partner} (${state.sequence[partner]})` : ' is unpaired');
    } else {
      hoverEl.textContent = 'Hover a base to inspect pairing';
    }
  }

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const world = screenToWorld(e.clientX - rect.left, e.clientY - rect.top);
    const next = nearestIndex(world);
    if (next !== hovered) {
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

  return { setState, resetView };
}
