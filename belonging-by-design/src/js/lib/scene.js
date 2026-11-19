import { gsap } from 'gsap';
import { createStory } from './story.js';
import { smooth, parseFocus, reducedMotion } from './util.js';

/** Paint a layer in as a circle growing from its focal point (p: 0 → 1). Keeps registration with the base art. */
export function setLayerReveal(img, p, focus = parseFocus(img)) {
  const r = (p * 78).toFixed(2);
  img.style.clipPath = p >= 1 ? 'none' : `circle(${r}% at ${focus.x}% ${focus.y}%)`;
  img.style.opacity = Math.min(1, p * 1.6).toFixed(3);
}

/**
 * 06 · Neighborhood. The scene sticks while the callout cards scroll over it; as each card rises
 * into view, its layer grows into the picture. On screens narrower than 16:9 the canvas is wider
 * than the stage, so it pans to whichever layer was added last.
 */
export function initScene() {
  const scene = document.querySelector('[data-scene]');
  if (!scene) return;

  const stage = scene.querySelector('.scene__stage');
  const canvas = scene.querySelector('[data-pan]');
  const layers = [...canvas.querySelectorAll('[data-layer]')];
  const focus = layers.map(parseFocus);
  const cards = [...scene.querySelectorAll('[data-step]')].map((s) => s.firstElementChild);

  layers.forEach((img) => setLayerReveal(img, 0));

  let panTarget = 50;
  const panTo = (fx, instant = false) => {
    panTarget = fx;
    const W = canvas.offsetWidth;
    const w = stage.clientWidth;
    const x = W <= w + 1 ? 0 : Math.min(0, Math.max(w - W, w / 2 - (fx / 100) * W));
    gsap.to(canvas, {
      x,
      duration: instant || reducedMotion() ? 0 : 1.4,
      ease: 'power3.inOut',
      overwrite: true,
    });
  };

  createStory(scene, {
    fade: false,
    onActive: (i) => panTo(i > 0 ? focus[i - 1].x : 50),
    onRender: ({ area }) => {
      cards.forEach((card, i) => {
        if (i === 0) return; // the statement card has no layer
        const top = card.getBoundingClientRect().top;
        // the layer builds while the card travels from the bottom edge to 55% of the stage
        const p = 1 - smooth(area.top + area.h * 0.55, area.bottom, top);
        setLayerReveal(layers[i - 1], p, focus[i - 1]);
      });
    },
  });

  panTo(50, true);
  window.addEventListener('resize', () => panTo(panTarget, true));
}
