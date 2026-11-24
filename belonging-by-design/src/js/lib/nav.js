import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from './util.js';

/**
 * Fixed nav: reading-progress bar, active chapter, and quick glides to each chapter.
 * Below 1024px the chapter links fold into a flyout opened by a menu button that shows the
 * current chapter; picking a chapter closes it and glides there, as on desktop.
 */
export function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const bar = nav.querySelector('.nav__progress');
  const track = nav.querySelector('.nav__track');
  const current = nav.querySelector('.nav__current');
  const links = [...nav.querySelectorAll('[data-chapter-link]')];
  const menu = nav.querySelector('.nav__menu');
  const scrim = nav.querySelector('.nav__scrim');
  const compact = matchMedia('(max-width: 1023px)');

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate(self) {
      gsap.set(bar, { scaleX: self.progress });
      track.setAttribute('aria-valuenow', String(Math.round(self.progress * 100)));
    },
  });

  // A chapter is active from its first section's top to its last section's bottom, measured at mid-screen.
  const setActive = (id) => {
    links.forEach((l) => {
      if (l.dataset.chapterLink === id) l.setAttribute('aria-current', 'true');
      else l.removeAttribute('aria-current');
    });
    const link = links.find((l) => l.dataset.chapterLink === id);
    if (current) current.textContent = link ? link.textContent : 'Menu';
  };

  links.forEach((link) => {
    const id = link.dataset.chapterLink;
    const sections = document.querySelectorAll(`[data-chapter="${id}"]`);
    if (!sections.length) return;
    ScrollTrigger.create({
      trigger: sections[0],
      endTrigger: sections[sections.length - 1],
      start: 'top center',
      end: 'bottom center',
      onToggle: (self) => {
        if (self.isActive) setActive(id);
        else if (!links.some((l) => l.getAttribute('aria-current') && l !== link)) setActive(null);
      },
    });
  });

  // ---- small-screen flyout ----
  const setOpen = (open, { moveFocus = false } = {}) => {
    nav.classList.toggle('is-open', open);
    menu?.setAttribute('aria-expanded', String(open));
    if (!moveFocus) return;
    (open ? links[0] : menu)?.focus({ preventScroll: true });
  };
  const isOpen = () => nav.classList.contains('is-open');

  // keyboard activation (click with detail 0) moves focus into the panel; a tap leaves it be
  menu?.addEventListener('click', (e) => setOpen(!isOpen(), { moveFocus: e.detail === 0 }));
  scrim?.addEventListener('click', () => setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen()) setOpen(false, { moveFocus: true });
  });
  // rotating to a wide layout puts the links back in the bar
  compact.addEventListener('change', () => setOpen(false));

  // In-page jumps (chapters and the title) glide instead of snapping. Quick and distance-aware:
  // ~0.4s for a screen or two, never more than 0.8s even across the whole page.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    setOpen(false);
    const screens = Math.abs(target.getBoundingClientRect().top) / window.innerHeight;
    gsap.to(window, {
      scrollTo: { y: target, autoKill: true },
      duration: reducedMotion() ? 0 : Math.min(0.8, 0.35 + screens * 0.03),
      ease: 'power2.inOut',
      overwrite: true,
    });
    history.replaceState(null, '', a.getAttribute('href'));
  });
}
