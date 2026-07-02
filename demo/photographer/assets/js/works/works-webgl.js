import * as THREE from "../vendor/three.module.js";

const fragmentShader = `
  uniform sampler2D uTexture;
  uniform float uTime;
  uniform float uHover;
  uniform float uReduce;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // カーソル中心のリップルでUVを歪める。ホバー量と距離で減衰
    float dist = distance(uv, uMouse);
    float strength = smoothstep(0.45, 0.0, dist) * uHover;
    float ripple = sin(dist * 16.0 - uTime * 3.5) * 0.03;
    uv += normalize(uv - uMouse + 0.0001) * ripple * strength * (1.0 - uReduce);

    vec4 tex = texture2D(uTexture, uv);

    // 結像メタファー：ホバー前はモノクロ、ホバーで色が戻る
    float gray = dot(tex.rgb, vec3(0.299, 0.587, 0.114));
    vec3 color = mix(vec3(gray), tex.rgb, uHover);

    gl_FragColor = vec4(color, 1.0);
  }
`;

export const worksEffect = ({ reduceMotion = false } = {}) => ({
  selector: '[data-webgl="works"]',
  readyClass: "is-webgl",
  fragmentShader,
  uniforms: () => ({
    uHover: { value: 0 },
    uReduce: { value: reduceMotion ? 1 : 0 },
    uMouse: { value: new THREE.Vector2(0.5, 0.5) },
  }),
  setup: (item) => {
    item.hover = 0;
    item.target = 0;
    const link = item.el.closest("[data-webgl-link]");
    if (!link) return;
    link.addEventListener("mouseenter", () => (item.target = 1));
    link.addEventListener("mouseleave", () => (item.target = 0));
    link.addEventListener("mousemove", (e) => {
      const rect = item.el.getBoundingClientRect();
      item.material.uniforms.uMouse.value.set(
        (e.clientX - rect.left) / rect.width,
        1 - (e.clientY - rect.top) / rect.height,
      );
    });
  },
  onFrame: (item) => {
    item.hover += (item.target - item.hover) * 0.08;
    item.material.uniforms.uHover.value = item.hover;
  },
});
