import { createStory } from './story.js';

/**
 * 09 · Brain. The brain holds while the region cards scroll; the matching hotspot lights up.
 * Hotspots (and, on small screens, the region chips) jump the scroll to their card,
 * so the brain is clickable without abandoning the scroll-driven sequence.
 */
export function initBrain() {
  const section = document.querySelector('[data-brain]');
  if (!section) return;

  const dots = [...section.querySelectorAll('.hotspot')];
  const chips = [...section.querySelectorAll('.brain__legend [data-hotspot]')];

  const story = createStory(section, {
    onActive: (i) => {
      // step 0 is the intro; steps 1–5 map to hotspots 1–5
      [...dots, ...chips].forEach((el) => {
        const on = Number(el.dataset.hotspot) === i;
        el.classList.toggle('is-active', on);
        el.setAttribute('aria-pressed', String(on));
      });
      // keep the active chip centred in its row (scroll only the row, never the page)
      const chip = chips[i - 1];
      const row = chip?.parentElement;
      if (row && row.scrollWidth > row.clientWidth) {
        row.scrollTo({ left: chip.offsetLeft - (row.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' });
      }
    },
  });

  section.addEventListener('click', (e) => {
    const target = e.target.closest('[data-hotspot]');
    if (!target) return;
    story.scrollToStep(Number(target.dataset.hotspot));
  });
}
