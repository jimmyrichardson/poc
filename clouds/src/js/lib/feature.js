console.log('[peabody-house]');

// Import your updated fragment shader as a string
import fragmentShaderSource from './clouds.frag?raw';

// Minimal passthrough vertex shader
const vertexShaderSource = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

// Create canvas and get WebGL context
const canvas = document.createElement('canvas');
document.body.appendChild(canvas);
const gl = canvas.getContext('webgl');
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  gl.viewport(0, 0, canvas.width, canvas.height);
}
resizeCanvas();

// Compile shader helper
function compileShader(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(shader));
  }
  return shader;
}

// Create program
const vertexShader = compileShader(gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = compileShader(gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);
if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
  throw new Error(gl.getProgramInfoLog(program));
}
gl.useProgram(program);

// Fullscreen quad
const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(
  gl.ARRAY_BUFFER,
  new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
  ]),
  gl.STATIC_DRAW
);
const aPosition = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(aPosition);
gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

// Uniform locations
const uResolution = gl.getUniformLocation(program, 'iResolution');
gl.uniform3f(uResolution, canvas.width, canvas.height, 1.0);
// const uTime = gl.getUniformLocation(program, 'u_time');
const uTime = gl.getUniformLocation(program, 'iTime');
gl.uniform1f(uTime, performance.now() * 0.001);
const uMouse = gl.getUniformLocation(program, 'iMouse');
const uMouseTime = gl.getUniformLocation(program, 'u_mouseTime');

// Uniform state
let mouse = [0.5, 0.5];
let lastMouseMove = performance.now();

// Mouse event
canvas.addEventListener('mousemove', (e) => {
  mouse[0] = e.clientX;
  mouse[1] = e.clientY;
  lastMouseMove = performance.now();
});

// Responsive resize
window.addEventListener('resize', () => {
  resizeCanvas();
});

// Animation loop
function render() {
  gl.viewport(0, 0, canvas.width, canvas.height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  gl.uniform2f(uResolution, canvas.width, canvas.height);
  gl.uniform1f(uTime, performance.now() * 0.001);
  gl.uniform2f(uMouse, mouse[0], mouse[1]);
  gl.uniform1f(uMouseTime, (performance.now() - lastMouseMove) * 0.001);

  gl.drawArrays(gl.TRIANGLES, 0, 6);
  requestAnimationFrame(render);
}
render();