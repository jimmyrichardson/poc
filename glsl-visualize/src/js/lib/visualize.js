import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
import { vertexShader, fragmentShader } from './shaders.js';

let camera, scene, renderer, uniforms, analyser, dataArray;

init();
animate();

function init() {
  renderer = new THREE.WebGLRenderer({ antialias: true });
  document.body.appendChild(renderer.domElement);

  // High DPI rendering
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene = new THREE.Scene();
  camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  uniforms = {
    uTime: { value: 0.0 },
    uAudioLevel: { value: 0.0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }
  };

  const material = new THREE.ShaderMaterial({
    fragmentShader,
    vertexShader,
    uniforms
  });

  const geometry = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  setupAudio();

  window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  uniforms.uResolution.value.set(width, height);
}

function animate(time) {
  requestAnimationFrame(animate);

  uniforms.uTime.value = time * 0.001;

  if (analyser && dataArray) {
    analyser.getByteFrequencyData(dataArray);
    const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
    uniforms.uAudioLevel.value = avg / 256.0;
  }

  renderer.render(scene, camera);
}

function setupAudio() {
  const button = document.getElementById('startButton');
  button.textContent = 'Start Music';
  let audio, context, source;

  button.onclick = async () => {
    if (!audio) {
      audio = new Audio('./public/audio/music.mp3'); // Replace with your local or hosted audio file
      audio.crossOrigin = "anonymous";

      context = new AudioContext();
      source = context.createMediaElementSource(audio);
      analyser = context.createAnalyser();
      analyser.fftSize = 256;
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      source.connect(analyser);
      analyser.connect(context.destination);

      await audio.play();
      button.textContent = 'Stop Music';
    } else if (audio.paused) {
      await audio.play();
      button.textContent = 'Stop Music';
    } else {
      audio.pause();
      button.textContent = 'Start Music';
    }
  };
}
