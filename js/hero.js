import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// ---------- Slim word set: classic gender/royalty analogy ----------
const WORDS = [
  // [name, x, y, z, color]
  ['king',     -1.6,  1.2, 0.4, 0xf7768e],
  ['queen',     1.6,  1.2, 0.4, 0xf7768e],
  ['man',      -1.6,  0.0, 0.0, 0x7aa2f7],
  ['woman',     1.6,  0.0, 0.0, 0x7aa2f7],
  ['father',   -1.6,  0.3, 1.2, 0xe0af68],
  ['mother',    1.6,  0.3, 1.2, 0xe0af68],
  ['uncle',    -1.6,  0.3,-1.2, 0x9ece6a],
  ['aunt',      1.6,  0.3,-1.2, 0x9ece6a],
  ['boy',      -1.6, -1.2, 0.0, 0xbb9af7],
  ['girl',      1.6, -1.2, 0.0, 0xbb9af7],
];

const PAIRS = [
  ['king','queen'], ['man','woman'], ['father','mother'],
  ['uncle','aunt'], ['boy','girl'],
];

// ---------- Scene setup ----------
const canvas = document.getElementById('hero-canvas');
const container = canvas.parentElement;
const getSize = () => ({
  w: container.clientWidth,
  h: container.clientHeight,
});

const scene = new THREE.Scene();
scene.background = null;
scene.fog = new THREE.Fog(0x080a0f, 8, 22);

const { w: w0, h: h0 } = getSize();
const camera = new THREE.PerspectiveCamera(55, w0 / h0, 0.1, 100);
camera.position.set(6, 3.5, 7.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(w0, h0, false);
renderer.setClearColor(0x080a0f, 1);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.enablePan = false;
controls.enableZoom = false;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.4;
controls.minPolarAngle = Math.PI * 0.25;
controls.maxPolarAngle = Math.PI * 0.7;

scene.add(new THREE.AmbientLight(0xffffff, 0.7));
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(8, 10, 6);
scene.add(dir);

// Halt auto-rotate when user interacts, resume after idle
let lastInteract = 0;
controls.addEventListener('start', () => {
  controls.autoRotate = false;
  lastInteract = performance.now();
});
controls.addEventListener('end', () => { lastInteract = performance.now(); });

// ---------- Build word points ----------
const sphereGeo = new THREE.SphereGeometry(0.18, 16, 12);
const wordIndex = new Map();

function makeLabel(text, hexColor) {
  const fontSize = 64;
  const padding = 14;
  const c = document.createElement('canvas');
  const ctx = c.getContext('2d');
  ctx.font = `600 ${fontSize}px -apple-system, "Segoe UI", Roboto, sans-serif`;
  const w = Math.ceil(ctx.measureText(text).width) + padding * 2;
  const h = fontSize + padding * 2;
  c.width = w; c.height = h;
  ctx.font = `600 ${fontSize}px -apple-system, "Segoe UI", Roboto, sans-serif`;
  ctx.fillStyle = 'rgba(15, 18, 25, 0.9)';
  ctx.strokeStyle = '#' + hexColor.toString(16).padStart(6, '0');
  ctx.lineWidth = 4;
  roundRect(ctx, 0, 0, w, h, 18);
  ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, padding, h / 2);
  const tex = new THREE.CanvasTexture(c);
  tex.minFilter = THREE.LinearFilter;
  tex.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  const s = 0.0085;
  sprite.scale.set(w * s, h * s, 1);
  return sprite;
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x+r, y);
  ctx.arcTo(x+w, y, x+w, y+h, r);
  ctx.arcTo(x+w, y+h, x, y+h, r);
  ctx.arcTo(x, y+h, x, y, r);
  ctx.arcTo(x, y, x+w, y, r);
  ctx.closePath();
}

for (const [name, x, y, z, color] of WORDS) {
  const mat = new THREE.MeshStandardMaterial({ color, emissive: color, emissiveIntensity: 0.35, roughness: 0.4 });
  const m = new THREE.Mesh(sphereGeo, mat);
  m.position.set(x, y, z);
  scene.add(m);
  const label = makeLabel(name, color);
  label.position.copy(m.position).add(new THREE.Vector3(0, 0.5, 0));
  scene.add(label);
  wordIndex.set(name, m);
}

// Analogy lines (parallel gender vectors)
const lineMat = new THREE.LineBasicMaterial({ color: 0xf7768e, transparent: true, opacity: 0.35 });
for (const [a, b] of PAIRS) {
  const A = wordIndex.get(a), B = wordIndex.get(b);
  if (!A || !B) continue;
  const geo = new THREE.BufferGeometry().setFromPoints([A.position, B.position]);
  scene.add(new THREE.Line(geo, lineMat));
}

// ---------- Resize & loop ----------
function onResize() {
  const { w, h } = getSize();
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}
window.addEventListener('resize', onResize);

function tick() {
  // Resume auto-rotate after 4s of idle
  if (!controls.autoRotate && performance.now() - lastInteract > 4000) {
    controls.autoRotate = true;
  }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();
