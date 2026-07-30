import { gsap } from 'gsap';

const BODY_WIDTH = 22;
const HEAD_WIDTH = 58;
/** Fraction of path length from the arrowhead (path start) that tapers up to HEAD_WIDTH. */
const HEAD_RATIO = 0.12;

const svg = document.querySelector('.draw');
const defs = svg?.querySelector('defs');
const layer = document.querySelector('#draw-layer');
const centerline = document.querySelector('#trace');

function widthAt(tFromStart) {
  if (tFromStart >= HEAD_RATIO) return BODY_WIDTH;
  const u = tFromStart / HEAD_RATIO;
  const s = u * u * (3 - 2 * u);
  return HEAD_WIDTH + (BODY_WIDTH - HEAD_WIDTH) * s;
}

function tangentAngle(path, d, len, delta) {
  const p1 = path.getPointAtLength(Math.max(0, d - delta));
  const p2 = path.getPointAtLength(Math.min(len, d + delta));
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

function buildRibbon(path) {
  const len = path.getTotalLength();
  const steps = 180;
  const delta = Math.max(0.5, len / steps);
  const left = [];
  const right = [];

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const d = t * len;
    const p = path.getPointAtLength(d);
    const angle = tangentAngle(path, d, len, delta);
    const hw = widthAt(t) / 2;
    const ox = Math.sin(angle) * hw;
    const oy = -Math.cos(angle) * hw;
    left.push([p.x + ox, p.y + oy]);
    right.push([p.x - ox, p.y - oy]);
  }

  const startHw = widthAt(0) / 2;
  const endHw = widthAt(1) / 2;

  // Outline: left side → round end cap → right side reverse → round start cap
  let d = `M${left[0][0]} ${left[0][1]}`;
  for (let i = 1; i < left.length; i++) d += `L${left[i][0]} ${left[i][1]}`;
  // Semicircle at tip (path end), bulging forward
  d += `A${endHw} ${endHw} 0 0 1 ${right[right.length - 1][0]} ${right[right.length - 1][1]}`;
  for (let i = right.length - 2; i >= 0; i--) d += `L${right[i][0]} ${right[i][1]}`;
  // Semicircle at arrowhead (path start), bulging backward
  d += `A${startHw} ${startHw} 0 0 1 ${left[0][0]} ${left[0][1]}`;
  d += 'Z';

  return { d, len };
}

if (svg && defs && layer && centerline) {
  const { d: ribbonD, len } = buildRibbon(centerline);
  const ns = 'http://www.w3.org/2000/svg';
  // Extra dash length so round mask caps fully clear both ribbon ends
  const maskPad = HEAD_WIDTH;

  // Static brushes are geometry references only — hide so the masked ribbon is what draws
  for (const el of layer.querySelectorAll('#trace, #trace-head, #cap-tip')) {
    el.setAttribute('visibility', 'hidden');
  }

  const mask = document.createElementNS(ns, 'mask');
  mask.setAttribute('id', 'draw-mask');
  mask.setAttribute('maskUnits', 'userSpaceOnUse');

  const maskBg = document.createElementNS(ns, 'rect');
  maskBg.setAttribute('x', '-100');
  maskBg.setAttribute('y', '-100');
  maskBg.setAttribute('width', '700');
  maskBg.setAttribute('height', '700');
  maskBg.setAttribute('fill', 'black');

  const maskStroke = document.createElementNS(ns, 'path');
  maskStroke.setAttribute('d', centerline.getAttribute('d'));
  maskStroke.setAttribute('fill', 'none');
  maskStroke.setAttribute('stroke', 'white');
  maskStroke.setAttribute('stroke-width', String(HEAD_WIDTH + 10));
  maskStroke.setAttribute('stroke-linecap', 'round');
  maskStroke.setAttribute('stroke-linejoin', 'round');

  mask.append(maskBg, maskStroke);
  defs.append(mask);

  const ribbon = document.createElementNS(ns, 'path');
  ribbon.setAttribute('id', 'ribbon');
  ribbon.setAttribute('d', ribbonD);
  ribbon.setAttribute('fill', '#74F183');
  ribbon.setAttribute('mask', 'url(#draw-mask)');
  layer.append(ribbon);

  // Negative offset draws from path end (top) toward path start (arrowhead)
  gsap.set(maskStroke, {
    attr: {
      'stroke-dasharray': len + maskPad,
      'stroke-dashoffset': -(len + maskPad),
    },
  });

  gsap.to(maskStroke, {
    attr: { 'stroke-dashoffset': 0 },
    duration: 2,
    ease: 'power2.inOut',
  });
}
