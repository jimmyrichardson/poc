export const clamp01 = (x) => Math.min(1, Math.max(0, x));

/** Smoothstep from a → b (works in either direction). */
export const smooth = (a, b, x) => {
  const t = clamp01((x - a) / (b - a));
  return t * t * (3 - 2 * t);
};

export const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Matches the CSS breakpoint where stories stack (media on top, steps underneath). */
export const isStacked = () => matchMedia('(max-width: 899px)').matches;

export const navHeight = () => document.querySelector('.nav')?.offsetHeight ?? 0;

/** "78.5 53.7" → { x: 78.5, y: 53.7 } (percent of the 16:9 scene). */
export const parseFocus = (el) => {
  const [x = 50, y = 50] = (el?.dataset.focus || '').split(/\s+/).map(Number);
  return { x, y };
};
