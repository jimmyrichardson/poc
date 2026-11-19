import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';
import { SplitText } from 'gsap/SplitText';

import { initNav } from './lib/nav.js';
import { initExpanders } from './lib/expand.js';
import { createStory } from './lib/story.js';
import { initScene } from './lib/scene.js';
import { initBrain } from './lib/brain.js';
import { initCycle } from './lib/cycle.js';
import { initCover, initSplits, initReveals, initVoices, initBenefits, initClose } from './lib/reveal.js';
import { initDialogs } from './lib/dialog.js';

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, SplitText);

// Mobile address-bar show/hide changes innerHeight; don't recompute every trigger for it.
ScrollTrigger.config({ ignoreMobileResize: true });

if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

initNav();
initCover();
initExpanders();

// 03 · Connection is a need and 05 · Foundation: image holds, text changes
document.querySelectorAll('[data-story]:not([data-brain]):not([data-cycle])').forEach((s) => createStory(s));
initScene();
initBrain();
initCycle();

initSplits();
initReveals();
initVoices();
initBenefits();
initClose();
initDialogs();

// Literata/Figtree swap in after first paint; re-measure once they have.
document.fonts?.ready.then(() => ScrollTrigger.refresh());
window.addEventListener('load', () => ScrollTrigger.refresh());
