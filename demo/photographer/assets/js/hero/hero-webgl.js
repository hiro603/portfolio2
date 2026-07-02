import * as THREE from "../vendor/three.module.js";

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform vec2 uMouse;
  uniform float uReduce;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    float m = 1.0 - uReduce; // reduce時は動き0

    // 常時のゆるい呼吸（極小のうねり）
    uv.x += sin(uv.y * 6.0 + uTime * 0.6) * 0.004 * m;
    uv.y += cos(uv.x * 6.0 + uTime * 0.5) * 0.004 * m;

    // カーソルへ向けた軽い屈折（被写界深度の引き寄せ）
    float d = distance(uv, uMouse);
    float lens = smoothstep(0.6, 0.0, d) * 0.02 * m;
    uv += (uMouse - uv) * lens;

    gl_FragColor = texture2D(uTexture, uv);
  }
`;

export const heroEffect = ({ reduceMotion = false } = {}) => ({
  selector: ".p-hero__img",
  readyClass: "is-webgl-hero",
  eager: true,
  fragmentShader,
  uniforms: () => ({
    uReduce: { value: reduceMotion ? 1 : 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  }),
  setup: (item) => {
    item.targetMouse = new THREE.Vector2(0.5, 0.5);
    window.addEventListener("mousemove", (e) => {
      const rect = item.el.getBoundingClientRect();
      item.targetMouse.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      );
    });
  },
  onFrame: (item) => {
    item.material.uniforms.uMouse.value.lerp(item.targetMouse, 0.06);
  },
});
