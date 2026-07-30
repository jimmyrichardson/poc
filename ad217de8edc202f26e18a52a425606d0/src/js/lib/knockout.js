import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Matches the x/y inset on #knockout-photo so the translate never exposes an edge. */
const PHOTO_PAD = 60;
const GRADIENT_Y1 = 0;
const GRADIENT_Y2 = 511.776;

const knockout = document.querySelector('#knockout');
const gradient = document.querySelector('#paint0_linear_603_30');
const darkStop = document.querySelector('#knockout-dark-stop');
const photo = document.querySelector('#knockout-photo');

if (knockout && gradient && darkStop && photo) {
  const tl = gsap.timeline({ paused: true });

  // Dark purple rises/fades over the solid #8B79FF base; photo follows slightly faster.
  tl.fromTo(
    gradient,
    { attr: { y1: GRADIENT_Y1 + PHOTO_PAD, y2: GRADIENT_Y2 + PHOTO_PAD } },
    { attr: { y1: GRADIENT_Y1, y2: GRADIENT_Y2 }, duration: 2, ease: 'power3.out' },
    0,
  )
    .fromTo(
      darkStop,
      { attr: { 'stop-opacity': 0 } },
      { attr: { 'stop-opacity': 1 }, duration: 2, ease: 'power3.out' },
      0,
    )
    .fromTo(
      photo,
      { opacity: 0, y: PHOTO_PAD },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' },
      0.12,
    );

  // Only start from the top once the reset trigger below has actually rewound us;
  // otherwise resume, so re-crossing the 40% line mid-view doesn't replay.
  const play = () => {
    if (tl.progress() === 0) tl.restart();
    else tl.play();
  };

  // Playhead: fires when the element's top passes 40% of the viewport.
  ScrollTrigger.create({
    trigger: knockout,
    start: 'top 40%',
    end: 'bottom top',
    onEnter: play,
    onEnterBack: play,
  });

  // Reset boundary: spans the full window where any part of the element is on
  // screen, so leaving in either direction means it's completely out of view.
  ScrollTrigger.create({
    trigger: knockout,
    start: 'top bottom',
    end: 'bottom top',
    onLeave: () => tl.pause(0),
    onLeaveBack: () => tl.pause(0),
  });
}
