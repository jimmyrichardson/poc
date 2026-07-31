import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Plays a paused timeline when `trigger` scrolls into view, and rewinds it once
 * `trigger` is fully off screen in either direction — so every section replays
 * from the top on the way back rather than sitting finished.
 *
 * Shared by the arrow draw and the photo knockout: both sit below the fold, so
 * both need the same entry point.
 */
export function revealOnScroll(trigger, tl) {
  // Only start from the top once the reset trigger below has actually rewound
  // us; otherwise resume, so re-crossing the 40% line mid-view doesn't replay.
  const play = () => {
    // invalidate() re-measures any function-based values before replaying.
    if (tl.progress() === 0) tl.invalidate().restart();
    else tl.play();
  };

  // Playhead: fires when the element's top passes 40% of the viewport.
  ScrollTrigger.create({
    trigger,
    start: 'top 40%',
    end: 'bottom top',
    onEnter: play,
    onEnterBack: play,
  });

  // Reset boundary: spans the full window where any part of the element is on
  // screen, so leaving in either direction means it's completely out of view.
  ScrollTrigger.create({
    trigger,
    start: 'top bottom',
    end: 'bottom top',
    // suppressEvents: false — the arrow's mask is written from an onUpdate, so a
    // silent seek would leave it holding the fully-drawn path.
    onLeave: () => tl.pause(0, false),
    onLeaveBack: () => tl.pause(0, false),
  });
}
