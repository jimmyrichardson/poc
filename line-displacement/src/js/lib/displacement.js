import * as THREE from 'three';

// Setup renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio); // <-- Add this line
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Setup scene and camera
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
  -window.innerWidth / 2, window.innerWidth / 2,
  window.innerHeight / 2, -window.innerHeight / 2,
  1, 1000
);
camera.position.z = 10;

// Parameters
const NUM_LINES = 42;
const LINE_LENGTH = window.innerWidth;
const LINE_POINTS = 256;

// Create a water-like displacement texture (simple noise)
const size = 1024;
const data = new Uint8Array(size * size * 8);
for (let i = 0; i < size * size * 3; i++) {
  data[i] = 512 + 64 * Math.sin(i / 10) + 64 * Math.cos(i / 24);
}
const displacementTexture = new THREE.DataTexture(data, size, size, THREE.RGBFormat);
displacementTexture.needsUpdate = true;

// Mouse state
let mouse = { x: 0, y: 0 };

// Declare these BEFORE they're used!
const lineOffsets = new Float32Array(NUM_LINES); // Current offset for each line
const targetOffsets = new Float32Array(NUM_LINES); // Target offset for each line

// Listen for mousemove
window.addEventListener('mousemove', (e) => {
  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  const mouseY = (e.clientY / window.innerHeight) * window.innerHeight - window.innerHeight / 2;
  for (let i = 0; i < NUM_LINES; i++) {
    const lineY = ((i / (NUM_LINES - 1)) * 2 - 1) * window.innerHeight / 2;
    const dist = mouseY - lineY;  //lineY - mouseY; // <-- Note: lineY - mouseY
    const influence = Math.exp(-(dist * dist) / 30000);
    targetOffsets[i] = Math.sign(dist) * 120 * influence; // 80 = strength
  }
});

// Shader material for lines
const lineMaterial = new THREE.ShaderMaterial({
  uniforms: {
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uDisp: { value: displacementTexture },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uLineOffsets: { value: lineOffsets },
    uMusicAmplitude: { value: 0 }
  },
  vertexShader: `
    uniform float uTime;
    uniform vec2 uMouse;
    uniform vec2 uResolution;
    uniform float uLineOffsets[${NUM_LINES}];
    attribute float lineIndex;
    attribute float baseY;
    varying float vLineIndex;
    uniform float uMusicAmplitude;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
    }
    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) +
             (c - a) * u.y * (1.0 - u.x) +
             (d - b) * u.x * u.y;
    }

    void main() {
      vLineIndex = lineIndex;
      vec3 pos = position;

      // Map position to [0,1] for noise input
      vec2 uv = vec2(
        (pos.x + uResolution.x/2.0) / uResolution.x,
        (baseY + uResolution.y/2.0) / uResolution.y
      );

      // Noise for displacement
      float n = noise(uv * 9.0 + vec2(uTime * 0.05, uTime * 0.05));

      // Calculate max allowed displacement (90% of the distance to next line)
      float lineSpacing = uResolution.y / float(${NUM_LINES - 1});
      float maxDisp = 0.9 * 1.5 * lineSpacing;

      // Main displacement
      float disp = (n - 0.5) * 2.0 * maxDisp;

      // Add the interactive offset for this line
      float offset = uLineOffsets[int(lineIndex)];

      // Add a local wave around the mouse (Gaussian falloff from x=0)
      float wave = offset * exp(-pow((pos.x - uMouse.x * (uResolution.x/2.0)) / (uResolution.x * 0.15), 2.0));
      pos.y = -baseY + clamp(disp, -maxDisp, maxDisp) + wave;

      pos.y += sin(uTime * 2.0 + pos.x * 0.01 + vLineIndex) * uMusicAmplitude * 20.0;

      gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
    }
  `,
  fragmentShader: `
    void main() {
      gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color
    }
  `,
  transparent: false
});

// Store references to lines so you can remove them later
const lines = [];

function createLines() {
  // Remove old lines
  for (const line of lines) {
    scene.remove(line);
    line.geometry.dispose();
  }
  lines.length = 0;

  for (let i = 0; i < NUM_LINES; i++) {
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const lineIndices = [];
    const baseYs = [];
    const y = ((i / (NUM_LINES - 1)) * 2 - 1) * window.innerHeight / 2;
    for (let j = 0; j < LINE_POINTS; j++) {
      const x = ((j / (LINE_POINTS - 1)) * 2 - 1) * window.innerWidth / 2;
      positions.push(x, y, 0);
      lineIndices.push(i);
      baseYs.push(y);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geometry.setAttribute('lineIndex', new THREE.Float32BufferAttribute(lineIndices, 1));
    geometry.setAttribute('baseY', new THREE.Float32BufferAttribute(baseYs, 1));
    const line = new THREE.Line(geometry, lineMaterial);
    scene.add(line);
    lines.push(line);
  }
}

// Initial creation
createLines();

// --- Audio Setup ---
let audio, audioCtx, source, analyser, dataArray, isPlaying = false;
const playButton = document.getElementById('play');
let musicAmplitude = 0;

// Setup audio context and analyser
function setupAudio() {
  if (audioCtx) return; // Only setup once
  audio = new Audio('./public/audio/music.mp3');
  audio.crossOrigin = "anonymous";
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  source = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  dataArray = new Uint8Array(analyser.frequencyBinCount);
  source.connect(analyser);
  analyser.connect(audioCtx.destination);
}

// Play/pause logic
playButton.addEventListener('click', () => {
  setupAudio();
  if (!isPlaying) {
    audioCtx.resume();
    audio.play();
    playButton.textContent = 'Pause';
    isPlaying = true;
  } else {
    audio.pause();
    playButton.textContent = 'Play';
    isPlaying = false;
  }
});

// When music ends, reset button and lines
if (!audio) setupAudio();
audio.addEventListener('ended', () => {
  playButton.textContent = 'Play';
  isPlaying = false;
});

// --- Animation loop modification ---
function getMusicAmplitude() {
  if (isPlaying && analyser) {
    analyser.getByteTimeDomainData(dataArray);
    // Get average deviation from center (128)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += Math.abs(dataArray[i] - 128);
    }
    return sum / dataArray.length / 128; // Normalize to ~0..1
  }
  return 0;
}

function animate(time) {

  // Get music amplitude
  musicAmplitude = getMusicAmplitude();

  lineMaterial.uniforms.uTime.value = time * 0.001;
  lineMaterial.uniforms.uMouse.value.set(mouse.x, mouse.y);
  lineMaterial.uniforms.uLineOffsets.value = lineOffsets;
  lineMaterial.uniforms.uMusicAmplitude.value = musicAmplitude;

  // Inertia: move each lineOffset toward its targetOffset
  for (let i = 0; i < NUM_LINES; i++) {
    // Inertia toward user/mouse offset
    lineOffsets[i] += (targetOffsets[i] - lineOffsets[i]) * 0.12;
    // Add music jiggle to all lines, always
    if (isPlaying && musicAmplitude > 0.01) {
      lineOffsets[i] += Math.sin(time * 0.02 + i * 0.5) * musicAmplitude * 20;
    }
    // Decay user offsets
    targetOffsets[i] *= 0.999;
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Handle resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.left = -window.innerWidth / 2;
  camera.right = window.innerWidth / 2;
  camera.top = window.innerHeight / 2;
  camera.bottom = -window.innerHeight / 2;
  camera.updateProjectionMatrix();
  lineMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);

  // Recreate lines with new geometry
  createLines();
});