import { gsap } from 'gsap';
import { revealOnScroll } from './lib/reveal.js';
import './lib/knockout.js';
import './lib/scroll.js';

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

/**
 * Points along `path` from its end back to its start. Dense enough that the
 * polyline is exact under the mask's 68px round-capped stroke.
 */
function reversedPoints(path, steps = 600) {
  const len = path.getTotalLength();
  const pts = [];
  for (let i = steps; i >= 0; i--) pts.push(path.getPointAtLength((i / steps) * len));
  return pts;
}

/** Polyline covering `progress` (0–1) of `pts`, interpolated at the leading end. */
function partialPolyline(pts, progress) {
  if (progress <= 0) return '';

  const last = pts.length - 1;
  const pos = progress * last;
  const whole = Math.min(Math.floor(pos), last);

  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i <= whole; i++) d += `L${pts[i].x} ${pts[i].y}`;

  const frac = pos - whole;
  if (frac > 0 && whole < last) {
    const a = pts[whole];
    const b = pts[whole + 1];
    d += `L${a.x + (b.x - a.x) * frac} ${a.y + (b.y - a.y) * frac}`;
  }

  return d;
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
  const { d: ribbonD } = buildRibbon(centerline);
  const ns = 'http://www.w3.org/2000/svg';
  // Sampled end → start, so the mask grows from the tail toward the arrowhead
  const maskPoints = reversedPoints(centerline);

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
  maskStroke.setAttribute('d', '');
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

  // The mask stroke is extended point by point rather than unwrapped with
  // stroke-dasharray/-dashoffset: dash reveals render inconsistently across
  // browsers (Safari tiles the pattern and ignores the offset's sign), while
  // growing the geometry itself draws identically everywhere.
  const draw = { progress: 0 };
  const render = () => {
    maskStroke.setAttribute('d', partialPolyline(maskPoints, draw.progress));
  };

  // Starts empty: the section is below the fold, so nothing should be drawn
  // until revealOnScroll plays it in.
  render();

  const tl = gsap.timeline({ paused: true }).to(draw, {
    progress: 1,
    duration: 2,
    ease: 'power2.inOut',
    onUpdate: render,
  });

  revealOnScroll(svg, tl);
}
