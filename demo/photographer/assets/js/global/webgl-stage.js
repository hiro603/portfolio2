import * as THREE from "../vendor/three.module.js";

const defaultVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const createWebGLStage = ({ onProgress, onLoad } = {}) => {
  const canvas = document.createElement("canvas");
  canvas.className = "c-webgl";
  document.body.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
  const setFrustum = () => {
    camera.left = -window.innerWidth / 2;
    camera.right = window.innerWidth / 2;
    camera.top = window.innerHeight / 2;
    camera.bottom = -window.innerHeight / 2;
    camera.updateProjectionMatrix();
  };
  setFrustum();

  const manager = new THREE.LoadingManager();
  if (onProgress) {
    manager.onProgress = (_url, loaded, total) => onProgress(loaded / total);
  }
  if (onLoad) manager.onLoad = onLoad;

  const loader = new THREE.TextureLoader(manager);
  const lazyLoader = new THREE.TextureLoader(); // managerに載せない＝プリローダーは待たない
  const placeholder = new THREE.DataTexture(
    new Uint8Array([0, 0, 0, 0]),
    1,
    1,
    THREE.RGBAFormat,
  );
  placeholder.needsUpdate = true;
  const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
  const items = [];
  const elToItem = new Map();
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const item = elToItem.get(entry.target);
        if (!item) continue;
        item.visible = entry.isIntersecting;
        if (entry.isIntersecting && item.load) {
          item.load(); // 遅延ロード発火
          item.load = null; // 二度と呼ばない
        }
      }
    },
    { rootMargin: "300px 0px" }, //画面に入る300px手前で先読み（黒落ち防止）
  );

  const measure = () => {
    const sx = window.scrollX;
    const sy = window.scrollY;
    for (const { item } of items) {
      const rect = item.el.getBoundingClientRect();
      item.base = {
        width: rect.width,
        height: rect.height,
        left: rect.left + sx, // ドキュメント基準（scroll非依存）
        top: rect.top + sy,
      };
      item.mesh.scale.set(rect.width, rect.height, 1); // サイズもresize時だけ
    }
  };

  const add = ({
    selector,
    fragmentShader,
    vertexShader = defaultVertexShader,
    uniforms = () => ({}),
    setup,
    onFrame,
    readyClass,
    eager = false,
  }) => {
    const els = [...document.querySelectorAll(selector)];
    if (els.length === 0) return;

    els.forEach((el) => {
      const src = el.currentSrc || el.src;

      const material = new THREE.ShaderMaterial({
        uniforms: {
          uTexture: { value: placeholder },
          uTime: { value: 0 },
          ...uniforms(),
        },
        vertexShader,
        fragmentShader,
      });

      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const item = { el, mesh, material, visible: true };

      const applyTexture = (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        material.uniforms.uTexture.value = texture;
      };

      if (eager) {
        applyTexture(loader.load(src)); // managerが追跡＝プリローダーが待つ
      } else {
        item.load = () => lazyLoader.load(src, applyTexture); // 初回可視で一度
      }
      if (setup) setup(item);
      elToItem.set(el, item);
      io.observe(el);
      items.push({ item, onFrame });
    });

    if (readyClass) document.body.classList.add(readyClass);
  };

  const sync = () => {
    const sx = window.scrollX;
    const sy = window.scrollY;
    for (const { item } of items) {
      if (!item.visible) continue;
      const b = item.base;
      if (!b) continue;
      const left = b.left - sx;
      const top = b.top - sy;
      item.mesh.position.x = left + b.width / 2 - window.innerWidth / 2;
      item.mesh.position.y = -(top + b.height / 2) + window.innerHeight / 2;
    }
  };

  const start = () => {
    measure();
    window.addEventListener("load", measure); // 画像で行が伸びた後の補正

    const clock = new THREE.Clock();
    let rafId;

    const tick = () => {
      const t = clock.getElapsedTime();
      for (const { item, onFrame } of items) {
        if (!item.visible) {
          item.mesh.visible = false;
          continue;
        }
        item.mesh.visible = true;
        item.material.uniforms.uTime.value = t;
        if (onFrame) onFrame(item, t);
      }
      sync();
      renderer.render(scene, camera);
      rafId = requestAnimationFrame(tick);
    };
    tick();

    document.addEventListener("visibilitychange", () => {
      cancelAnimationFrame(rafId); // 二重起動防止
      if (!document.hidden) tick(); // 復帰時だけ再開
    });
  };

  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    setFrustum();
    measure();
  });

  return { add, start, manager };
};
