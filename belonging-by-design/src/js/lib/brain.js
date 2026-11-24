/**
 * 09 · Brain. One screen, nothing to scroll through: the regions are optional.
 * A hotspot (or, on small screens, a region chip) expands that region's card in place; another
 * hotspot swaps the card's content, and the same hotspot, the close button or Escape collapses it.
 * Idle hotspots keep pulsing so the brain reads as clickable.
 *
 * This only sets state; the CSS does the motion. On desktop the card opens over the intro copy in
 * the same grid cell, so the layout never changes size. On small screens it unfolds under the chips.
 */
export function initBrain() {
  const section = document.querySelector('[data-brain]');
  if (!section) return;

  const regions = [...section.querySelectorAll('[data-region]')];
  const controls = [...section.querySelectorAll('[data-hotspot]')];
  const close = section.querySelector('.brain__close');
  let active = 0; // 0 = closed

  const select = (next) => {
    active = next;
    section.classList.toggle('is-open', next > 0);

    controls.forEach((el) => {
      const on = Number(el.dataset.hotspot) === next;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-expanded', String(on));
    });
    regions.forEach((r) => {
      const on = Number(r.dataset.region) === next;
      r.classList.toggle('is-active', on);
      r.inert = !on;
    });
  };

  select(0);

  section.addEventListener('click', (e) => {
    const target = e.target.closest('[data-hotspot]');
    if (!target) return;
    const i = Number(target.dataset.hotspot);
    select(i === active ? 0 : i);
  });

  close.addEventListener('click', () => {
    // hand focus back to the visible control that opened it (the chip on small screens, else the dot)
    const from = controls.findLast((el) => el.classList.contains('is-active') && el.offsetParent);
    select(0);
    from?.focus({ preventScroll: true });
  });

  section.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && active) close.click();
  });
}
