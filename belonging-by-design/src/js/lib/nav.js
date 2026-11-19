import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reducedMotion } from './util.js';

/** Fixed nav: reading-progress bar, active chapter, and smooth jumps to each chapter. */
export function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const bar = nav.querySelector('.nav__progress');
  const track = nav.querySelector('.nav__track');
  const current = nav.querySelector('.nav__current');
  const links = [...nav.querySelectorAll('[data-chapter-link]')];

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
    if (current) current.textContent = link ? link.textContent : '';
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

  // In-page jumps (chapters and the title) glide instead of snapping.
  document.addEventListener('click', (e) => {
    const a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    const target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    gsap.to(window, {
      scrollTo: { y: target, autoKill: true },
      duration: reducedMotion() ? 0 : 1.2,
      ease: 'power3.inOut',
    });
    history.replaceState(null, '', a.getAttribute('href'));
  });
}
