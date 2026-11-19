import { createStory } from './story.js';
import { reducedMotion } from './util.js';

/**
 * 12 · Bridge cycle. The diagram holds while four invisible steps scroll past;
 * each step lights the next tile, and the dashed ring turns with the scroll.
 */
export function initCycle() {
  const section = document.querySelector('[data-cycle]');
  if (!section) return;

  const tiles = [...section.querySelectorAll('.tile')];
  const ring = section.querySelector('.cycle__ring');
  const turn = reducedMotion() ? 0 : 1;

  createStory(section, {
    fade: false,
    onActive: (i, prev) => {
      tiles.forEach((t, j) => t.classList.toggle('is-on', j <= i));
      const lit = tiles[i];
      if (lit && i > prev && turn) {
        lit.classList.add('is-pop');
        setTimeout(() => lit.classList.remove('is-pop'), 380);
      }
    },
    onRender: ({ area }) => {
      if (!ring) return;
      const r = section.getBoundingClientRect();
      const span = Math.max(1, r.height - area.h);
      const p = Math.min(1, Math.max(0, (area.top - r.top) / span));
      ring.style.rotate = `${(p * 90 * turn).toFixed(2)}deg`;
    },
  });
}
