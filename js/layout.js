export function circularLayout(length, radius = 250) {
  const out = [];
  const step = (Math.PI * 2) / Math.max(length, 1);
  for (let i = 0; i < length; i += 1) {
    const a = -Math.PI / 2 + i * step;
    out.push({ x: Math.cos(a) * radius, y: Math.sin(a) * radius });
  }
  return out;
}
