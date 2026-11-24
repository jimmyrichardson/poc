import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { smooth, isStacked, navHeight, reducedMotion } from './util.js';

/**
 * Sticky-media story: the media stays in place (CSS sticky) while the steps scroll past it.
 * Every value is a pure function of where each step sits in the viewport, so scrolling back
 * and forth scrubs the sequence, and "See more" panels can grow a step without any re-pinning.
 *
 * Each step's text fades in as it rises into the reading area and out as it leaves, so it reads
 * as "the text changes while the image holds". The first step never fades in (it arrives with the
 * section) and the last never fades out (it leaves with the section).
 *
 * @param {HTMLElement} story
 * @param {{ onActive?: (index:number, prev:number) => void, onRender?: (ctx:object) => void, fade?: boolean }} opts
 */
export function createStory(story, { onActive, onRender, fade = true } = {}) {
  const media = story.querySelector('.story__media, .scene__stage');
  const steps = [...story.querySelectorAll('[data-step]')];
  const contents = steps.map((s) => s.querySelector('.story__content'));
  const drift = reducedMotion() ? 0 : 48;
  let active = -1;

  /**
   * The part of the viewport the steps are read in: below the nav, or below the sticky media when
   * stacked. Scenes, the cycle and [data-overlay] stories scroll their text over full-stage media,
   * so they read in the whole stage.
   */
  const area = () => {
    const vh = window.innerHeight;
    const top = isStacked() && media && !story.matches('[data-scene], [data-cycle], [data-overlay]')
      ? Math.max(navHeight(), media.getBoundingClientRect().bottom)
      : navHeight();
    return { top, bottom: vh, h: vh - top };
  };

  const render = () => {
    const a = area();
    const line = a.top + a.h * 0.5;
    let next = 0;

    steps.forEach((step, i) => {
      if (step.getBoundingClientRect().top <= line) next = i;
      const content = contents[i];
      if (!fade || !content) return;

      const r = content.getBoundingClientRect();
      // in: the content's top rises from 92% → 52% of the reading area
      const fin = i === 0 ? 1 : 1 - smooth(a.top + a.h * 0.52, a.top + a.h * 0.92, r.top);
      // out: the content's bottom leaves from 32% → 0% of the reading area
      const fout = i === steps.length - 1 ? 1 : smooth(a.top, a.top + a.h * 0.32, r.bottom);
      const o = Math.min(fin, fout);
      const y = (1 - fin) * drift - (1 - fout) * drift;
      content.style.opacity = o.toFixed(3);
      content.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`;
    });

    if (next !== active) {
      const prev = active;
      active = next;
      story.dataset.activeStep = String(active);
      onActive?.(active, prev);
    }
    onRender?.({ area: a, active, steps });
  };

  const trigger = ScrollTrigger.create({
    trigger: story,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: render,
    onToggle: render,
    onRefresh: render,
  });

  // Keep rendering while a "See more" inside the story animates its height.
  story.addEventListener('expand:progress', render);

  render();

  return {
    trigger,
    steps,
    render,
    get active() {
      return active;
    },
    /** Smooth-scroll so step i's content sits in the middle of the reading area. */
    scrollToStep(i) {
      const step = steps[i];
      if (!step) return;
      const target = contents[i] || step;
      const r = target.getBoundingClientRect();
      const a = area();
      // content renders offset by its fade drift; measure from the step itself for a stable target
      const stepR = step.getBoundingClientRect();
      const offsetInStep = (stepR.height - r.height) / 2;
      const y = window.scrollY + stepR.top + offsetInStep - (a.top + (a.h - r.height) / 2);
      gsap.to(window, {
        scrollTo: { y: Math.max(0, y), autoKill: true },
        duration: reducedMotion() ? 0 : 1.1,
        ease: 'power2.inOut',
      });
    },
  };
}
