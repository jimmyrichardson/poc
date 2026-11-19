import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from './util.js';

/**
 * "See more" opens the section in place; "See less" / "Close" returns it.
 *
 * No page jump:
 * - Opening grows the panel downward from where the reader is looking (bottom-aligned sections
 *   grow upward instead, so the link stays put).
 * - Closing keeps the button that was pressed fixed on screen by scrolling with the collapse,
 *   so the reader never loses their place, even if they had scrolled deep into the opened text.
 * - Native scroll anchoring is off (see base.css) so the browser does not compensate twice.
 */
export function initExpanders() {
  const toggles = [...document.querySelectorAll('[data-expand-toggle]')];
  const panels = new Set(toggles.map((t) => document.getElementById(t.getAttribute('aria-controls'))));

  panels.forEach((panel) => {
    if (!panel) return;
    panel.inert = true;
    panel.dataset.open = 'false';
  });

  toggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(btn.getAttribute('aria-controls'));
      if (!panel) return;
      toggle(panel, panel.dataset.open !== 'true', btn);
    });
  });
}

function toggle(panel, open, pressed) {
  const scope = panel.closest('[data-expand-scope]');
  const story = panel.closest('[data-story]');
  const scrim = scope?.querySelector(':scope > [data-scrim]');
  const hideOnOpen = scope ? [...scope.querySelectorAll(':scope > [data-hide-on-open]')] : [];
  const controls = [...document.querySelectorAll(`[aria-controls="${panel.id}"]`)];
  const inner = panel.firstElementChild;
  const quick = reducedMotion();
  const dur = quick ? 0.01 : 0.7;

  panel.dataset.open = String(open);
  panel.inert = !open;
  // added straight away on open, removed only once the panel has fully closed (see onComplete)
  if (open) scope?.classList.add('is-open');

  controls.forEach((c) => {
    if (c.hasAttribute('aria-expanded')) c.setAttribute('aria-expanded', String(open));
    if (c.dataset.labelMore) c.textContent = open ? c.dataset.labelLess : c.dataset.labelMore;
    const chevron = c.querySelector('[data-chevron]');
    if (chevron) chevron.src = open ? chevron.dataset.openSrc : chevron.dataset.closedSrc;
  });

  // Closing: hold the pressed control still. A "Close" inside the panel disappears with it, so hold
  // the panel's bottom edge instead: the content after it stays put and the page eases back up.
  const closingFromInside = !open && panel.contains(pressed);
  const anchorY = () => {
    if (open) return 0;
    const r = (closingFromInside ? panel : pressed).getBoundingClientRect();
    return closingFromInside ? r.bottom : r.top;
  };
  const anchorStart = anchorY();

  const tl = gsap.timeline({
    defaults: { ease: 'power3.inOut' },
    onUpdate() {
      if (!open) {
        const delta = anchorY() - anchorStart;
        if (Math.abs(delta) > 0.5) window.scrollBy(0, delta);
      }
      story?.dispatchEvent(new Event('expand:progress'));
    },
    onComplete() {
      if (!open) {
        panel.style.height = '0px';
        if (![...scope?.querySelectorAll('.expand') ?? []].some((p) => p.dataset.open === 'true')) {
          scope?.classList.remove('is-open');
        }
      }
      ScrollTrigger.refresh();
      story?.dispatchEvent(new Event('expand:progress'));
      // the in-panel "Close" just went inert; hand focus back to the control that opened it
      if (closingFromInside) controls.find((c) => !panel.contains(c))?.focus({ preventScroll: true });
    },
  });

  if (open) {
    tl.to(panel, { height: 'auto', duration: dur }, 0);
    if (inner) {
      tl.fromTo(inner.children, { autoAlpha: 0, y: quick ? 0 : 14 },
        { autoAlpha: 1, y: 0, duration: dur * 0.8, stagger: 0.07, ease: 'power2.out' }, dur * 0.25);
    }
  } else {
    if (inner) tl.to(inner.children, { autoAlpha: 0, duration: dur * 0.4, ease: 'power1.out' }, 0);
    tl.fromTo(panel, { height: panel.offsetHeight }, { height: 0, duration: dur }, dur * 0.1);
  }

  if (scrim) {
    tl.to(scrim, { opacity: Number(open ? scrim.dataset.open : scrim.dataset.closed), duration: dur }, 0);
  }
  if (hideOnOpen.length) {
    tl.to(hideOnOpen, { autoAlpha: open ? 0 : 1, duration: dur * 0.6, ease: 'power2.out' }, open ? 0 : dur * 0.4);
  }

  return tl;
}
