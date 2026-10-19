/**
 * The avatar energy field — raw WebGL2, no 3D library.
 *
 * A full-screen triangle runs one fragment shader that draws a flowing
 * energy field around the avatar: radial tendrils lifting off a bright
 * core, tinted with the product's accent, breathing with `u_energy`
 * (the live audio level) and leaning toward `u_pointer`.
 *
 * Three.js would add roughly 150 KB to the critical path for this. A
 * shader is ~120 lines and keeps LCP under budget on a 4G phone.
 */

export const VERT = `#version 300 es
// Full-screen triangle — no vertex buffer, no attributes.
out vec2 vUv;
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  vUv = p;
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}
`;

export const FRAG = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform float uTime;
uniform float uEnergy;   // 0..1, live audio level
uniform float uPointerX; // -1..1
uniform float uPointerY;
uniform float uAspect;
uniform float uDpr;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p *= 2.02;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = (vUv - 0.5) * vec2(uAspect, 1.0);

  // Pointer parallax — the field leans toward the cursor.
  vec2 lean = vec2(uPointerX, uPointerY) * 0.045;
  vec2 p = uv - lean;

  float r = length(p);
  float ang = atan(p.y, p.x);

  float t = uTime * 0.12;
  float flow = fbm(p * 2.6 + vec2(t, -t * 0.7));
  float tendril = sin(ang * 11.0 + flow * 7.0 + uTime * 0.5)
                + sin(ang * 6.0 - flow * 4.0 - uTime * 0.31) * 0.6;
  tendril = tendril / 1.6 * 0.5 + 0.5;

  // Energy rises with the audio level.
  float energy = 0.55 + uEnergy * 0.85;
  float body = smoothstep(0.62, 0.02, r);
  float halo = smoothstep(0.58, 0.0, r);
  float core = smoothstep(0.16, 0.0, r);

  float field = halo * (0.20 + tendril * 0.30) * energy;
  field += body * 0.05 * energy;
  field += core * (0.55 + uEnergy * 0.45);

  vec3 cyan = vec3(0.0, 0.898, 1.0);
  vec3 ice  = vec3(0.60, 0.95, 1.0);
  vec3 col = mix(cyan, ice, clamp(tendril * 0.5 + core, 0.0, 1.0));

  float alpha = clamp(field, 0.0, 1.0) * 0.85;
  outColor = vec4(col * field * 1.35, alpha);
}
`;
