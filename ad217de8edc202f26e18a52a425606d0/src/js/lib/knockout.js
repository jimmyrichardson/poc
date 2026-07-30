import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Matches the x/y inset on #knockout-photo so the translate never exposes an edge. */
const PHOTO_PAD = 60;
const GRADIENT_Y1 = 0;
const GRADIENT_Y2 = 511.776;

/** Matches the `gap` between bubbles in components/blurbs.css. */
const CONVO_GAP = 8;
/** Timeline position where the conversation picks up — just after the photo settles. */
const CONVO_START = 0.95;
const TYPING_HOLD = 1;

const knockout = document.querySelector('#knockout');
const gradient = document.querySelector('#paint0_linear_603_30');
const darkStop = document.querySelector('#knockout-dark-stop');
const photo = document.querySelector('#knockout-photo');
const typing = document.querySelector('#convo-typing');
const received = document.querySelector('#convo-received');
const sent = document.querySelector('#convo-sent');
const dots = document.querySelectorAll('.blurb__dot');

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

  if (typing && received && sent) {
    // The received bubble sits low (where the typing bubble was) until the sent
    // bubble arrives and pushes it up into its final slot. Measured lazily so a
    // late-loading font can't bake in a stale offset.
    const shift = () => sent.offsetHeight + CONVO_GAP;
    // Bubbles are stacked flush right, so the received bubble's leading edge is
    // wherever its own width puts it — the typing bubble has to meet it there.
    const lead = () => received.offsetLeft;
    const pop = { opacity: 1, scale: 1, duration: 0.42, ease: 'back.out(2)' };
    const typingOut = CONVO_START + TYPING_HOLD;
    const sentIn = typingOut + 0.85;

    tl.set(typing, { left: lead }, CONVO_START)
      .fromTo(typing, { opacity: 0, scale: 0.4 }, { ...pop }, CONVO_START)
      .to(typing, { opacity: 0, scale: 0.6, duration: 0.22, ease: 'power2.in' }, typingOut)
      .fromTo(received, { opacity: 0, scale: 0.4, y: shift }, { ...pop }, typingOut + 0.14)
      .fromTo(sent, { opacity: 0, scale: 0.4 }, { ...pop }, sentIn)
      .to(received, { y: 0, duration: 0.42, ease: 'back.out(1.4)' }, sentIn);

    // Ambient dot wave — independent of the timeline, hidden along with the bubble.
    gsap.to(dots, {
      opacity: 0.9,
      y: -3,
      duration: 0.4,
      ease: 'sine.inOut',
      stagger: 0.16,
      repeat: -1,
      repeatDelay: 0.16,
      yoyo: true,
    });
  }

  // Only start from the top once the reset trigger below has actually rewound us;
  // otherwise resume, so re-crossing the 40% line mid-view doesn't replay.
  const play = () => {
    // invalidate() re-measures the function-based bubble offset before replaying.
    if (tl.progress() === 0) tl.invalidate().restart();
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
