import { gsap } from "gsap";

document.querySelectorAll(".line").forEach((svg) => {
  const path = svg.querySelector(".path-gradient");
  const isVertical = svg.classList.contains("left");
  const width = svg.clientWidth;
  const height = svg.clientHeight;
  const centerX = width / 2;
  const centerY = height / 2;
  const segments = 240;
  const segmentLength = isVertical ? height / segments : width / segments;

  const waveAmplitude = 30;
  const detectionRadius = 200;
  const state = { offset: 0, pos: isVertical ? centerY : centerX };

  function drawLine(amplitude = 0, wavePos = state.pos) {
    const falloffRadius = 90;
    let d = isVertical ? `M${centerX},0 ` : `M0,${centerY} `;

    for (let i = 0; i <= segments; i++) {
      const t = i * segmentLength;
      const dt = (t - wavePos) / falloffRadius;
      const falloff = Math.exp(-dt * dt);

      const maxOffset = waveAmplitude;
      let sineOffset = Math.sin(i * 0.3) * Math.min(amplitude * falloff, maxOffset);

      if (i < 3 || i > segments - 3) {
        sineOffset *= (i < 3 ? i / 3 : (segments - i) / 3);
      }

      if (isVertical) {
        d += `L${centerX + sineOffset},${t} `;
      } else {
        d += `L${t},${centerY + sineOffset} `;
      }
    }

    if (path) {
      path.setAttribute("d", d);
    } else {
      svg.getElementById("leftPath").setAttribute("d", d);
      svg.getElementById("rightPath").setAttribute("d", d);
    }
  }

  function updatePath() {
    drawLine(state.offset, state.pos);
  }

  function animateTo(offset, pos, ease = "power2.out", duration = 1.4) {
    gsap.to(state, {
      offset,
      pos,
      duration,
      ease,
      onUpdate: updatePath,
      overwrite: "auto"
    });
  }

  svg.addEventListener("mousemove", (e) => {
    const rect = svg.getBoundingClientRect();
    const localX = e.clientX - rect.left;
    const localY = e.clientY - rect.top;

    const linePos = isVertical ? centerX : centerY;
    const cursorPos = isVertical ? localX : localY;
    const influencePos = isVertical ? localY : localX;

    const dx = cursorPos - linePos;
    const distance = Math.abs(dx);

    const proximityFactor = 1 - Math.min(distance / detectionRadius, 1);
    const strength = Math.pow(proximityFactor, 2);

    if (proximityFactor > 0) {
      const offset = waveAmplitude * strength;
      animateTo(offset, influencePos);
    }
  });

  svg.addEventListener("mouseleave", () => {
    animateTo(0, isVertical ? centerY : centerX);
  });

  drawLine();
});