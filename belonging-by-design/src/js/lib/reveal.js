import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { reducedMotion, parseFocus } from './util.js';
import { setLayerReveal } from './scene.js';

const m = () => (reducedMotion() ? 0 : 1);

/**
 * Split text into lines that fade up in a stagger: opacity plus a short rise, no line masks,
 * so nothing is clipped mid-animation. `autoSplit` re-splits on resize and font load and
 * re-runs the tween, so it is returned from onSplit for SplitText to clean up.
 */
function fadeUpLines(el, vars = {}) {
  SplitText.create(el, {
    type: 'lines',
    autoSplit: true,
    onSplit: (self) => gsap.from(self.lines, {
      autoAlpha: 0,
      y: 24,
      duration: 1.1,
      stagger: 0.1,
      ease: 'power3.out',
      ...vars,
    }),
  });
}

/** 01 · Cover: headline lines fade up, then the street scene builds its first three layers. */
export function initCover() {
  const cover = document.querySelector('.cover');
  if (!cover) return;

  const eyebrow = cover.querySelector('.t-eyebrow');
  const headline = cover.querySelector('[data-intro-split]');
  const scene = cover.querySelector('[data-cover-scene]');
  const [base, ...layers] = scene.querySelectorAll('img');

  gsap.set(cover.querySelectorAll('[data-intro]'), { visibility: 'visible' });

  if (!m()) return;

  gsap.from(eyebrow, { autoAlpha: 0, y: 16, duration: 0.9, ease: 'power3.out', delay: 0.1 });

  fadeUpLines(headline, { duration: 1.2, delay: 0.2 });

  const tl = gsap.timeline({ delay: 0.55 });
  tl.from(base, { autoAlpha: 0, scale: 1.05, duration: 1.4, ease: 'power2.out' });
  layers.forEach((img, i) => {
    const focus = parseFocus(img);
    const state = { p: 0 };
    setLayerReveal(img, 0, focus);
    tl.to(state, {
      p: 1,
      duration: 1.1,
      ease: 'power2.out',
      onUpdate: () => setLayerReveal(img, state.p, focus),
    }, 0.7 + i * 0.4);
  });

  // a gentle drift as the cover scrolls away
  gsap.to(scene, {
    yPercent: 8,
    ease: 'none',
    scrollTrigger: { trigger: scene.parentElement, start: 'top top', end: 'bottom top', scrub: true },
  });
}

/** Headlines marked [data-split] fade up line by line when they enter. */
export function initSplits() {
  if (!m()) return;
  document.querySelectorAll('[data-split]').forEach((el) => {
    fadeUpLines(el, { scrollTrigger: { trigger: el, start: 'top 88%', once: true } });
  });
}

/** Simple fade-ups for supporting copy, and staggered groups. */
export function initReveals() {
  if (!m()) return;

  document.querySelectorAll('[data-reveal]').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      y: 32,
      duration: 1,
      ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 90%', once: true },
    });
  });

  document.querySelectorAll('[data-reveal-group]').forEach((group) => {
    gsap.from(group.children, {
      autoAlpha: 0,
      y: 48,
      duration: 1.1,
      stagger: 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: group, start: 'top 85%', once: true },
    });
  });

  // "How might we" placeholders slide in from the right
  document.querySelectorAll('[data-reveal-art]').forEach((el) => {
    gsap.from(el, {
      autoAlpha: 0,
      x: 60,
      duration: 1.3,
      ease: 'expo.out',
      scrollTrigger: { trigger: el, start: 'top 85%', once: true },
    });
  });

  // full-bleed photos drift slower than the page
  document.querySelectorAll('[data-parallax]').forEach((img) => {
    gsap.fromTo(img, { yPercent: -5 }, {
      yPercent: 5,
      ease: 'none',
      scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  });
}

/**
 * 07 · Voices. Wide screens: the collage opens up from an inset frame, then the play buttons pop in.
 * Small screens (under 700px, where the collage is swapped for full-width clips): each clip rises in
 * as it arrives, then its play button pops.
 *
 * Each set is created only while its layout is showing (gsap.matchMedia). A trigger on a hidden
 * element measures at the top of the page, so a `once` trigger there fires and kills itself during
 * setup, which corrupts ScrollTrigger's list and makes the next trigger created on the page throw.
 */
export function initVoices() {
  const grid = document.querySelector('[data-voices]');
  if (!grid || !m()) return;
  const collage = grid.querySelector('.voices__collage');
  const plays = grid.querySelectorAll('.play');
  const clips = document.querySelectorAll('[data-voices-list] .voice');

  const mm = gsap.matchMedia();

  mm.add('(min-width: 700px)', () => {
    gsap.fromTo(collage,
      { clipPath: 'inset(10% 10% 10% 10% round 28px)', scale: 1.06 },
      {
        clipPath: 'inset(0% 0% 0% 0% round 0px)',
        scale: 1,
        ease: 'none',
        scrollTrigger: { trigger: grid, start: 'top 90%', end: 'top 30%', scrub: 0.6 },
      });

    gsap.from(plays, {
      autoAlpha: 0,
      scale: 0.4,
      duration: 0.8,
      stagger: 0.12,
      ease: 'back.out(2.2)',
      scrollTrigger: { trigger: grid, start: 'top 45%', once: true },
    });
  });

  mm.add('(max-width: 699px)', () => {
    clips.forEach((clip) => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: clip, start: 'top 88%', once: true } });
      tl.from(clip, { autoAlpha: 0, y: 32, duration: 0.8, ease: 'power3.out' })
        .from(clip.querySelector('.voice__play'), { autoAlpha: 0, scale: 0.4, duration: 0.7, ease: 'back.out(2.2)' }, 0.25);
    });
  });
}

/** 11 · Benefits: copy fades up, illustrations rise from the bottom edge. */
export function initBenefits() {
  const grid = document.querySelector('[data-benefits]');
  if (!grid || !m()) return;

  gsap.from(grid.querySelectorAll('.benefit__copy'), {
    autoAlpha: 0,
    y: 32,
    duration: 1,
    stagger: 0.12,
    ease: 'power3.out',
    scrollTrigger: { trigger: grid, start: 'top 85%', once: true },
  });

  grid.querySelectorAll('.benefit__art img').forEach((img, i) => {
    gsap.from(img, {
      yPercent: 100,
      duration: 1.3,
      delay: (window.innerWidth >= 900 ? i : 0) * 0.12,
      ease: 'expo.out',
      scrollTrigger: { trigger: img.parentElement, start: 'top 92%', once: true },
    });
  });
}

/**
 * 18 · Close: the full neighborhood finishes building (the last four layers), then the scrim
 * settles and the closing statement rises in. Scrubbed, so it rebuilds if you scroll back.
 */
export function initClose() {
  const hero = document.querySelector('[data-close-hero]');
  if (!hero) return;
  const layers = [...hero.querySelectorAll('[data-layer]')];
  const scrim = hero.querySelector('.close__scrim');
  const text = hero.querySelector('[data-close-text]');

  if (!m()) return;

  layers.forEach((img) => setLayerReveal(img, 0));
  gsap.set(scrim, { opacity: 0 });

  const tl = gsap.timeline({
    scrollTrigger: { trigger: hero, start: 'top 85%', end: 'top 10%', scrub: 0.5 },
  });
  layers.forEach((img, i) => {
    const focus = parseFocus(img);
    const state = { p: 0 };
    tl.to(state, { p: 1, duration: 1, ease: 'none', onUpdate: () => setLayerReveal(img, state.p, focus) }, i * 0.45);
  });
  tl.to(scrim, { opacity: 0.72, duration: 1.2, ease: 'none' }, '>-0.2');

  fadeUpLines(text, { scrollTrigger: { trigger: hero, start: 'top 12%', once: true } });
}
