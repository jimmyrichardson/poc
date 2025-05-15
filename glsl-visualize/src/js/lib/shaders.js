export const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

export const fragmentShader = `
precision highp float;

uniform float uTime;
uniform float uAudioLevel;
uniform vec2 uResolution;

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;

  float lineCount = 18.0;
  float yIndex = uv.y * lineCount;
  float subY = fract(yIndex);

  float baseFreq = 50.0;
  float amp = 0.5 + uAudioLevel * 1.25;

  // Layered sine waves with varied frequency and phase
  float wave1 = sin(uv.x * baseFreq + yIndex * 0.6 + uTime * 0.3);
  float wave2 = 0.5 * sin(uv.x * baseFreq * 1.3 + yIndex * 1.4 + uTime * 0.1);
  float wave3 = 0.25 * sin(uv.x * baseFreq * 0.7 - yIndex * 0.8 - uTime * 0.6);
  float displacement = (wave1 + wave2 + wave3) * amp;

  // Add a linear ramp to tilt upward over X (45° angle)
  float slope = uv.x * 1.0; // Increasing from 0 to 1 across screen width
  float elevation = 0.25 * displacement + slope;
  
  // elevation = clamp(elevation, -0.005, 1.0);

  float thickness = 0.05;
  // float line = step(abs(subY - elevation), thickness);
  float edge = 0.01; // edge softness
  float line = smoothstep(thickness + edge, thickness - edge, abs(subY - elevation));

  vec3 backgroundColor = vec3(30.0 / 255.0);
  // vec3 lineColor = vec3(2.0 / 255.0, 4.0 / 255.0, 2.0 / 255.0);
  vec3 lineColor = vec3(255.0 / 255.0, 255.0 / 255.0, 255.0 / 255.0);

  vec3 color = mix(backgroundColor, lineColor, line);
  gl_FragColor = vec4(color, 1.0);
}

`;

// precision highp float;

// uniform float uTime;
// uniform float uAudioLevel;
// uniform vec2 uResolution;

// void main() {
//   vec2 uv = gl_FragCoord.xy / uResolution;

//   float lineCount = 25.0; // fewer lines for more spacing
//   float yIndex = uv.y * lineCount;
//   float subY = fract(yIndex);

//   float freq = 24.0;
//   float amp = 0.75 + uAudioLevel * 1.5;
//   float wave = (0.5 + 0.4 * sin(uv.x * freq + uTime * 0.5 + yIndex * 0.5) * amp);

//   float thickness = 0.075; // sharper lines
//   float line = step(abs(subY - wave), thickness);

//   vec3 backgroundColor = vec3(30.0 / 255.0, 30.0 / 255.0, 30.0 / 255.0); // #1E1E1E
//   vec3 lineColor = vec3(2.0 / 255.0, 4.0 / 255.0, 2.0 / 255.0); // #020402

//   vec3 color = mix(backgroundColor, lineColor, line);
//   gl_FragColor = vec4(color, 1.0);
// }

