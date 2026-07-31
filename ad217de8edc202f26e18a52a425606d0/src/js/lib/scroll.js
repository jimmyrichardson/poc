import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const bar = document.querySelector('.scroll-progress__bar');
const track = document.querySelector('.scroll-progress');
const cue = document.querySelector('.scroll-cue');

if (bar && track) {
  gsap.to(bar, {
    scaleX: 1,
    ease: 'none',
    scrollTrigger: {
      start: 0,
      end: 'max',
      scrub: 0.2,
      // The tween is the visual; this only keeps the a11y value in step.
      onUpdate: (self) => {
        track.setAttribute('aria-valuenow', String(Math.round(self.progress * 100)));
      },
    },
  });
}

// The cue only means anything while the hero is the thing on screen.
if (cue) {
  gsap.to(cue, {
    opacity: 0,
    ease: 'none',
    scrollTrigger: {
      trigger: cue,
      start: 'top 90%',
      end: 'top 40%',
      scrub: true,
    },
  });
}
