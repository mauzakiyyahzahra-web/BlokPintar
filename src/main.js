import * as THREE from 'three';
import { GAMES, QGEN, COLLECT, shuffle, rnd } from './data.js';
import { runOverlayGame } from './minigames.js';

/* ================= Simpanan & suara ================= */
const KEY = 'blokpintar-v1';
const DEFAULT_AVA = { skin: '#f1c27d', shirt: '#2f80ed', pants: '#27315a', hair: '#3b2314', shoes: '#222222', style: 'pendek', name: 'Pemain' };
let save = { stars: 0, best: {}, avatar: { ...DEFAULT_AVA } };
try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s) save = { ...save, ...s, avatar: { ...DEFAULT_AVA, ...(s.avatar || {}) } }; } catch (e) { }
const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(save)); } catch (e) { } };

let actx = null, muted = false;
function sfx(type) {
  if (muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const seq = { ok: [[660, .08], [880, .12]], bad: [[220, .18]], coin: [[988, .06], [1319, .1]], tap: [[520, .04]], jump: [[400, .08]], win: [[523, .1], [659, .1], [784, .1], [1047, .2]] }[type] || [[440, .1]];
    let t = actx.currentTime;
    for (const [f, d] of seq) {
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type === 'bad' ? 'sawtooth' : 'square'; o.frequency.value = f;
      g.gain.setValueAtTime(.06, t); g.gain.exponentialRampToValueAtTime(.001, t + d);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + d + .02); t += d;
    }
  } catch (e) { }
}

/* ================= Three dasar ================= */
const $ = (s) => document.querySelector(s);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('#app').appendChild(renderer.domElement);
const canvas = renderer.domElement;

const scene = new THREE.Scene();
const SKY = new THREE.Color(0x8fd3ff);
scene.background = SKY.clone(); scene.fog = new THREE.Fog(0x8fd3ff, 50, 140);
const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 400);
scene.add(new THREE.HemisphereLight(0xffffff, 0x5d7a4a, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.4);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 120 });
sun.shadow.bias = -0.0005;
scene.add(sun, sun.target);

addEventListener('resize', () => { renderer.setSize(innerWidth, innerHeight); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); });

/* ================= Helper ================= */
const matCache = {};
const mat = (c) => matCache[c] || (matCache[c] = new THREE.MeshStandardMaterial({ color: c, roughness: .75 }));
function box(w, h, d, m, x = 0, y = 0, z = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), typeof m === 'string' || typeof m === 'number' ? mat(m) : m);
  mesh.position.set(x, y, z); mesh.castShadow = true; mesh.receiveShadow = true; return mesh;
}
function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function makeLabel(text, { font = 54, fg = '#fff', bg = 'rgba(20,24,48,.78)', h = .55 } = {}) {
  const c = document.createElement('canvas'), ctx = c.getContext('2d');
  const f = `800 ${font}px system-ui,"Segoe UI",Roboto,"Noto Sans Arabic",sans-serif`; ctx.font = f;
  const lines = String(text).split('\n'); const pad = font * .4, lh = font * 1.25;
  const w = Math.ceil(Math.max(...lines.map(l => ctx.measureText(l).width)) + pad * 2), hh = Math.ceil(lh * lines.length + pad);
  c.width = w; c.height = hh; ctx.font = f;
  if (bg) { ctx.fillStyle = bg; rr(ctx, 0, 0, w, hh, Math.min(30, hh / 2)); ctx.fill(); }
  ctx.fillStyle = fg; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  lines.forEach((l, i) => ctx.fillText(l, w / 2, pad / 2 + lh * (i + .5)));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
  const H = h * lines.length * 1.25 + h * .4; sp.scale.set(H * w / hh, H, 1); sp.renderOrder = 5;
  return sp;
}
function gridTexture(base, line, n = 8) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, 128, 128); g.strokeStyle = line; g.lineWidth = 3; g.strokeRect(1.5, 1.5, 125, 125);
  g.fillStyle = line; g.globalAlpha = .35; g.beginPath(); g.arc(64, 64, 18, 0, 7); g.fill();
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(n, n); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
function disposeTree(o) {
  o.traverse(n => {
    if (n.geometry) n.geometry.dispose();
    if (n.material && !Object.values(matCache).includes(n.material)) { const ms = Array.isArray(n.material) ? n.material : [n.material]; ms.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); }); }
  });
}
const lerpAngle = (a, b, t) => { let d = ((b - a + Math.PI) % (Math.PI * 2)) - Math.PI; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; };

/* ================= Avatar (anggota tubuh lengkap) ================= */
class Avatar {
  constructor(cfg) {
    this.g = new THREE.Group(); this.t = 0;
    this.m = {}; for (const k of ['skin', 'shirt', 'pants', 'hair', 'shoes']) this.m[k] = new THREE.MeshStandardMaterial({ roughness: .7 });
    this.fc = document.createElement('canvas'); this.fc.width = this.fc.height = 128;
    this.ft = new THREE.CanvasTexture(this.fc); this.ft.colorSpace = THREE.SRGBColorSpace;
    this.faceMat = new THREE.MeshStandardMaterial({ map: this.ft, roughness: .7 });
    this.build(); this.apply(cfg);
  }
  build() {
    const M = this.m, g = this.g; this.p = {};
    // kaki: paha, lutut, betis, telapak/sepatu
    for (const s of [-1, 1]) {
      const hip = new THREE.Group(); hip.position.set(.17 * s, 1.0, 0); g.add(hip);
      hip.add(box(.27, .46, .3, M.pants, 0, -.23, 0));
      const knee = new THREE.Group(); knee.position.y = -.46; hip.add(knee);
      knee.add(box(.25, .42, .28, M.pants, 0, -.21, 0));
      knee.add(box(.27, .12, .42, M.shoes, 0, -.48, .06));
      this.p[s < 0 ? 'hipL' : 'hipR'] = hip; this.p[s < 0 ? 'kneeL' : 'kneeR'] = knee;
    }
    g.add(box(.7, .2, .36, M.pants, 0, 1.03, 0)); // pinggul
    g.add(box(.72, .74, .38, M.shirt, 0, 1.47, 0)); // badan
    // lengan: bahu, siku, lengan bawah, tangan
    for (const s of [-1, 1]) {
      const sh = new THREE.Group(); sh.position.set(.47 * s, 1.74, 0); g.add(sh);
      sh.add(box(.21, .4, .23, M.shirt, 0, -.18, 0));
      const el = new THREE.Group(); el.position.y = -.38; sh.add(el);
      el.add(box(.18, .32, .2, M.skin, 0, -.16, 0));
      el.add(box(.2, .17, .22, M.skin, 0, -.4, 0));
      sh.rotation.z = .06 * s;
      this.p[s < 0 ? 'shL' : 'shR'] = sh; this.p[s < 0 ? 'elL' : 'elR'] = el;
    }
    // leher + kepala
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(.11, .12, .16, 12), M.skin); neck.position.y = 1.9; neck.castShadow = true; g.add(neck);
    const head = new THREE.Group(); head.position.y = 1.96; g.add(head); this.p.head = head;
    const hm = new THREE.Mesh(new THREE.BoxGeometry(.56, .56, .56), [M.skin, M.skin, M.skin, M.skin, this.faceMat, M.skin]);
    hm.position.y = .29; hm.castShadow = true; head.add(hm);
    this.ears = [box(.07, .15, .11, M.skin, -.31, .29, 0), box(.07, .15, .11, M.skin, .31, .29, 0)]; this.ears.forEach(e => head.add(e));
    head.add(box(.08, .11, .07, M.skin, 0, .25, .31)); // hidung
    this.hairG = new THREE.Group(); head.add(this.hairG);
    this.neck = neck;
    // papan nama
    this.tag = null;
  }
  drawFace(skin) {
    const g = this.fc.getContext('2d'); g.fillStyle = skin; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(255,120,120,.35)'; g.beginPath(); g.ellipse(26, 80, 11, 7, 0, 0, 7); g.ellipse(102, 80, 11, 7, 0, 0, 7); g.fill();
    for (const x of [40, 88]) {
      g.fillStyle = '#fff'; g.beginPath(); g.ellipse(x, 60, 12, 14, 0, 0, 7); g.fill();
      g.fillStyle = '#1d1d2b'; g.beginPath(); g.ellipse(x + 1, 62, 7, 9, 0, 0, 7); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(x + 4, 58, 3, 0, 7); g.fill();
      g.strokeStyle = '#2b1b10'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x - 12, 40); g.lineTo(x + 10, 38); g.stroke();
    }
    g.strokeStyle = '#7a2e2e'; g.lineWidth = 6; g.beginPath(); g.arc(64, 86, 16, .2, Math.PI - .2); g.stroke();
    this.ft.needsUpdate = true;
  }
  setHair(style) {
    while (this.hairG.children.length) { const c = this.hairG.children.pop(); c.geometry.dispose(); }
    const H = this.m.hair, add = (...a) => this.hairG.add(box(...a));
    this.ears.forEach(e => e.visible = style !== 'kerudung');
    this.neck.visible = style !== 'kerudung';
    if (style === 'pendek') { add(.6, .14, .6, H, 0, .6, 0); add(.6, .42, .1, H, 0, .38, -.29); add(.6, .1, .07, H, 0, .52, .29); add(.07, .25, .5, H, -.3, .44, -.02); add(.07, .25, .5, H, .3, .44, -.02); }
    if (style === 'panjang') { add(.62, .14, .62, H, 0, .6, 0); add(.64, .75, .12, H, 0, .22, -.3); add(.08, .62, .5, H, -.31, .3, -.04); add(.08, .62, .5, H, .31, .3, -.04); add(.6, .12, .07, H, 0, .51, .29); }
    if (style === 'peci') { add(.6, .22, .6, H, 0, .66, 0); add(.6, .2, .1, mat('#2b1b10'), 0, .45, -.28); }
    if (style === 'kerudung') {
      add(.66, .08, .66, H, 0, .6, 0); add(.66, .66, .08, H, 0, .28, -.32); add(.08, .66, .6, H, -.32, .28, 0); add(.08, .66, .6, H, .32, .28, 0);
      add(.66, .1, .07, H, 0, .53, .31); add(.86, .4, .5, H, 0, -.12, 0);
    }
  }
  apply(cfg) {
    for (const k of ['skin', 'shirt', 'pants', 'hair', 'shoes']) this.m[k].color.set(cfg[k]);
    this.drawFace(cfg.skin); this.setHair(cfg.style);
    if (this.tag) { this.g.remove(this.tag); disposeTree(this.tag); }
    this.tag = makeLabel(cfg.name || 'Pemain', { font: 44, h: .28 }); this.tag.position.y = 2.95; this.g.add(this.tag);
  }
  animate(dt, speed, air) {
    const P = this.p; this.t += dt * (4 + 8 * speed);
    const s = Math.sin(this.t) * .75 * speed, k = 1 - Math.pow(.0005, dt);
    let tg;
    if (air) tg = { hipL: -.5, hipR: .25, kneeL: .5, kneeR: .3, shL: -2.6, shR: -2.6, elL: -.2, elR: -.2 };
    else tg = {
      hipL: -s, hipR: s, kneeL: Math.max(0, Math.sin(this.t)) * .9 * speed, kneeR: Math.max(0, -Math.sin(this.t)) * .9 * speed,
      shL: s * .9, shR: -s * .9, elL: -.25 - .3 * speed, elR: -.25 - .3 * speed
    };
    for (const n in tg) P[n].rotation.x += (tg[n] - P[n].rotation.x) * k;
    P.head.rotation.y = Math.sin(this.t * .3) * .05 * (1 - speed);
  }
}

const avatar = new Avatar(save.avatar);
scene.add(avatar.g);
const player = { pos: new THREE.Vector3(0, 0, 6), vy: 0, onGround: false, rot: Math.PI, support: null, speed: 7.5 };
let camYaw = 0, camPitch = .38, camDist = 10;

/* ================= Input ================= */
const keys = {}; let jumpQ = false, actQ = false;
addEventListener('keydown', e => {
  if (e.target.tagName === 'INPUT') return;
  keys[e.code] = true; if (e.code === 'Space') { jumpQ = true; e.preventDefault(); } if (e.code === 'KeyE' || e.code === 'Enter') actQ = true;
});
addEventListener('keyup', e => keys[e.code] = false);
addEventListener('blur', () => { for (const k in keys) keys[k] = false; });

const joy = $('#joy'), knob = $('#joy .knob'); let joyId = null; const joyV = { x: 0, y: 0 };
const updJoy = e => {
  const r = joy.getBoundingClientRect(); let dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  const m = r.width / 2, l = Math.hypot(dx, dy); if (l > m) { dx *= m / l; dy *= m / l; }
  knob.style.transform = `translate(${dx}px,${dy}px)`; joyV.x = dx / m; joyV.y = -dy / m;
};
joy.addEventListener('pointerdown', e => { joyId = e.pointerId; joy.setPointerCapture(e.pointerId); updJoy(e); });
joy.addEventListener('pointermove', e => { if (e.pointerId === joyId) updJoy(e); });
const endJoy = e => { if (e.pointerId === joyId) { joyId = null; joyV.x = joyV.y = 0; knob.style.transform = ''; } };
joy.addEventListener('pointerup', endJoy); joy.addEventListener('pointercancel', endJoy);
$('#btnJump').addEventListener('pointerdown', e => { e.preventDefault(); jumpQ = true; });
$('#btnAct').addEventListener('pointerdown', e => { e.preventDefault(); actQ = true; });
if (matchMedia('(pointer:coarse)').matches) document.body.classList.add('touch');

let drag = null;
canvas.addEventListener('pointerdown', e => { drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener('pointermove', e => {
  if (!drag || drag.id !== e.pointerId) return;
  camYaw -= (e.clientX - drag.x) * .006; camPitch = Math.max(.05, Math.min(1.25, camPitch + (e.clientY - drag.y) * .004));
  drag.x = e.clientX; drag.y = e.clientY;
});
const endDrag = e => { if (drag && drag.id === e.pointerId) drag = null; };
canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
canvas.addEventListener('wheel', e => { camDist = Math.max(4, Math.min(18, camDist + e.deltaY * .01)); }, { passive: true });

/* ================= Dunia ================= */
let mode = 'intro'; // intro | hub | obby | collect | overlay | result
let platforms = [];
const hubGroup = new THREE.Group(), levelGroup = new THREE.Group(); scene.add(hubGroup, levelGroup);
const hubPlatforms = [];
const portals = [];
const clouds = [];

function buildHub() {
  const ground = new THREE.Mesh(new THREE.BoxGeometry(150, 1, 150), new THREE.MeshStandardMaterial({ map: gridTexture('#5cc35c', '#4aa84a', 75), roughness: .9 }));
  ground.position.y = -.5; ground.receiveShadow = true; hubGroup.add(ground);
  hubPlatforms.push({ x: 0, z: 0, w: 150, d: 150, top: 0 });
  // plaza tengah
  const plaza = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, .3, 40), new THREE.MeshStandardMaterial({ map: gridTexture('#d9dde8', '#b9bfd0', 9), roughness: .9 }));
  plaza.position.y = .15; plaza.receiveShadow = true; hubGroup.add(plaza);
  hubPlatforms.push({ x: 0, z: 0, w: 12, d: 12, top: .3, circle: 9 });
  const title = makeLabel('🎓 BlokPintar\nDunia Game Edukasi', { font: 70, h: .9, bg: 'rgba(255,90,95,.92)' }); title.position.set(0, 7, 0); hubGroup.add(title);
  const sign = makeLabel('Jalan ke portal, lalu tekan E / tombol MASUK', { font: 40, h: .35 }); sign.position.set(0, 4.6, 0); hubGroup.add(sign);
  // tiang tengah
  hubGroup.add(box(.5, 3.6, .5, '#8d6e63', 0, 2.1, 0));
  // portal
  const r1 = 10, r2 = 15; const inner = 11, outer = GAMES.length - inner;
  GAMES.forEach((g, i) => {
    const ring = i < inner ? 0 : 1, idx = ring ? i - inner : i, cnt = ring ? outer : inner;
    const R = ring ? 34 : 20, a = (idx / cnt) * Math.PI * 2 + (ring ? .12 : 0);
    const x = Math.sin(a) * R, z = Math.cos(a) * R;
    const grp = new THREE.Group(); grp.position.set(x, 0, z); grp.rotation.y = a + Math.PI; hubGroup.add(grp);
    const col = new THREE.Color(g.color);
    grp.add(box(4.4, .3, 2.4, g.color, 0, .15, 0));
    grp.add(box(.55, 4.2, .55, '#f5f5f5', -1.8, 2.4, 0)); grp.add(box(.55, 4.2, .55, '#f5f5f5', 1.8, 2.4, 0));
    grp.add(box(4.2, .6, .6, g.color, 0, 4.6, 0));
    const pm = new THREE.MeshBasicMaterial({ color: col.clone().lerp(new THREE.Color('#ffffff'), .25), transparent: true, opacity: .65, side: THREE.DoubleSide });
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(3.05, 4), pm); plane.position.y = 2.3; grp.add(plane);
    const icon = makeLabel(g.emoji, { font: 90, bg: null, h: .9 }); icon.position.y = 2.4; grp.add(icon);
    hubPlatforms.push({ x, z, w: 3, d: 3, top: .3 });
    const p = { g, x, z, grp, pm, icon, label: null }; portals.push(p); setPortalLabel(p);
  });
  // pohon & batu
  for (let i = 0; i < 46; i++) {
    const a = Math.random() * Math.PI * 2, R = rnd(0, 1) ? rnd(24, 29) : rnd(40, 66);
    const x = Math.sin(a) * R, z = Math.cos(a) * R;
    if (portals.some(p => Math.hypot(p.x - x, p.z - z) < 5)) continue;
    const t = new THREE.Group(); t.position.set(x, 0, z); const s = .8 + Math.random() * .7; t.scale.setScalar(s);
    t.add(box(.6, 2, .6, '#8d5a3b', 0, 1, 0));
    const leaf = ['#2e9e4f', '#3dbb5c', '#27864a'][rnd(0, 2)];
    t.add(box(2.4, 1.4, 2.4, leaf, 0, 2.6, 0)); t.add(box(1.6, 1, 1.6, leaf, 0, 3.6, 0));
    hubGroup.add(t);
  }
  for (let i = 0; i < 14; i++) {
    const c = new THREE.Group(); const w = rnd(4, 9);
    c.add(box(w, 1.4, 3, '#ffffff', 0, 0, 0)); c.add(box(w * .6, 1.2, 2.4, '#ffffff', rnd(-1, 1), .9, 0));
    c.children.forEach(m => { m.castShadow = false; });
    c.position.set(rnd(-90, 90), rnd(26, 36), rnd(-90, 90)); scene.add(c); clouds.push(c);
  }
}
function setPortalLabel(p) {
  if (p.label) { p.grp.remove(p.label); disposeTree(p.label); }
  const b = save.best[p.g.id];
  p.label = makeLabel(`${p.g.name}\n${p.g.cat}${b != null ? ' · terbaik ⭐' + b : ''}`, { font: 46, h: .36, bg: 'rgba(20,24,48,.82)' });
  p.label.position.y = 5.75; p.grp.add(p.label);
}

/* ================= HUD ================= */
const hudStars = () => $('#stars').textContent = save.stars;
const gameHud = $('#gamehud');
function setGameHud(html) { gameHud.innerHTML = html; gameHud.hidden = !html; }
function toast(msg, cls = '') { const t = $('#toast'); t.className = 'show ' + cls; t.innerHTML = msg; clearTimeout(t._h); t._h = setTimeout(() => t.className = '', 1300); }

/* ================= Mode level ================= */
let level = null;
function clearLevel() {
  for (const c of [...levelGroup.children]) { levelGroup.remove(c); disposeTree(c); }
  level = null;
}
function goHub(near) {
  clearLevel(); closeModal(true);
  hubGroup.visible = true; clouds.forEach(c => c.visible = true); platforms = hubPlatforms;
  scene.background.copy(SKY); scene.fog.color.copy(SKY);
  mode = 'hub'; setGameHud(''); $('#hud').hidden = false;
  if (near) { const p = portals.find(p => p.g.id === near); if (p) { const d = Math.hypot(p.x, p.z); player.pos.set(p.x * (d - 4) / d, .3, p.z * (d - 4) / d); player.rot = Math.atan2(p.x, p.z); camYaw = player.rot + Math.PI; } }
  else { player.pos.set(0, .3, 6); player.rot = 0; camYaw = 0; }
  player.vy = 0;
}
function enterLevel(sky) {
  clearLevel(); hubGroup.visible = false; clouds.forEach(c => c.visible = false);
  scene.background.set(sky); scene.fog.color.set(sky); platforms = [];
  $('#prompt').hidden = true; $('#hud').hidden = true; camDist = 10;
}

function startGame(g) {
  sfx('tap'); $('#prompt').hidden = true;
  if (g.type === 'obby') return buildObby(g);
  if (g.type === 'collect') return buildCollect(g);
  openOverlayGame(g);
}

/* ---- OBBY: lompat ke platform jawaban benar ---- */
function buildObby(g) {
  enterLevel('#bfe6ff'); mode = 'obby';
  const N = 8, SP = 12;
  level = { type: 'obby', g, qs: [], signs: [], cur: 0, score: 0, falling: [], N };
  const water = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: '#3fa9f5', roughness: .3, transparent: true, opacity: .85 }));
  water.rotation.x = -Math.PI / 2; water.position.y = -14; levelGroup.add(water);
  const check = (i) => {
    const fin = i === N; const d = fin ? 8 : 4;
    const m = box(12, 1, d, fin ? '#ffd23f' : i % 2 ? '#e8ecf5' : '#ffffff', 0, -.5, i * SP + (fin ? 2 : 0)); levelGroup.add(m);
    platforms.push({ x: 0, z: i * SP + (fin ? 2 : 0), w: 12, d, top: 0, tag: fin ? 'finish' : 'cp', i });
    if (fin) {
      levelGroup.add(box(.5, 5, .5, '#ffffff', -5, 2.5, i * SP + 4)); levelGroup.add(box(.5, 5, .5, '#ffffff', 5, 2.5, i * SP + 4));
      levelGroup.add(box(10.5, 1, .5, '#ff5a5f', 0, 5.2, i * SP + 4));
      const l = makeLabel('🏁 FINISH', { font: 70, h: .7, bg: null, fg: '#fff' }); l.position.set(0, 5.3, i * SP + 3.6); levelGroup.add(l);
    }
  };
  const COLS = ['#ff6b6b', '#4dabf7', '#ffd43b'];
  for (let i = 0; i <= N; i++) {
    check(i);
    if (i === N) break;
    const q = QGEN[g.gen](); const opts = shuffle([q.a, ...q.wrong.slice(0, 2)]);
    level.qs.push(q);
    opts.forEach((o, k) => {
      const x = (k - 1) * 4, z = i * SP + 6;
      const m = box(3.6, .8, 4, new THREE.MeshStandardMaterial({ color: COLS[k], roughness: .6 }), x, -.4, z); levelGroup.add(m);
      const lab = makeLabel(o, { font: q.arabOpt ? 90 : 60, h: q.arabOpt ? .7 : .5 }); lab.position.set(x, 1.6, z); levelGroup.add(lab);
      platforms.push({ x, z, w: 3.6, d: 4, top: 0, tile: true, ok: o === q.a, row: i, mesh: m, lab });
    });
    const sign = makeLabel(`${q.big ? q.big + '  ' : ''}${q.q}`, { font: q.big ? 64 : 56, h: .55, bg: 'rgba(61,126,255,.92)' });
    sign.position.set(0, 4.6, i * SP + 7.5); sign.visible = i === 0; level.signs.push(sign); levelGroup.add(sign);
  }
  player.pos.set(0, .1, 0); player.vy = 0; player.rot = 0; camYaw = Math.PI; camPitch = .42;
  obbyHud();
}
function obbyHud() {
  const L = level;
  const q = L.cur < L.N ? L.qs[L.cur] : null;
  setGameHud(`<div class="gh-top"><b>${L.g.emoji} ${L.g.name}</b><span>Soal ${Math.min(L.cur + 1, L.N)}/${L.N} · ⭐ ${L.score}</span><button id="quit">✖ Keluar</button></div>
    ${q ? `<div class="gh-q">${q.big ? `<span class="gh-big">${q.big}</span>` : ''}${q.q}</div>` : '<div class="gh-q">Lari ke garis FINISH! 🏁</div>'}`);
  $('#quit').onclick = () => goHub(L.g.id);
}
function onLand(sup) {
  if (mode !== 'obby') return;
  const L = level;
  if (sup.tag === 'finish') { if (!L.done) { L.done = true; sfx('win'); setTimeout(() => showResult(L.g, L.score, L.N), 400); } return; }
  if (!sup.tile || sup.dead || sup.row !== L.cur) return;
  const rowTiles = platforms.filter(p => p.tile && p.row === sup.row);
  if (sup.ok) {
    sup.mesh.material.color.set('#2ecc71'); sfx('ok');
    if (!L.miss) { L.score++; toast('✅ Benar! +1 ⭐', 'good'); } else toast('✅ Benar!', 'good');
    rowTiles.filter(p => !p.ok).forEach(dropTile);
    L.signs.forEach((sg, k) => sg.visible = k === L.cur + 1); L.cur++; L.miss = false; obbyHud();
  } else {
    sup.mesh.material.color.set('#e74c3c'); sfx('bad'); L.miss = true; toast('❌ Salah! Coba lagi', 'bad');
    dropTile(sup);
  }
}
function dropTile(p) {
  p.dead = true; platforms = platforms.filter(x => x !== p); level.falling.push({ m: p.mesh, l: p.lab, vy: 0 });
}

/* ---- KUMPULKAN: lari ambil benda yang benar ---- */
function buildCollect(g) {
  enterLevel('#ffe8b3'); mode = 'collect';
  const cfg = COLLECT[g.set]; const S = 17;
  const floor = new THREE.Mesh(new THREE.BoxGeometry(S * 2 + 2, 1, S * 2 + 2), new THREE.MeshStandardMaterial({ map: gridTexture('#ffd27a', '#f0b648', 18), roughness: .9 }));
  floor.position.y = -.5; floor.receiveShadow = true; levelGroup.add(floor);
  platforms.push({ x: 0, z: 0, w: S * 2 + 2, d: S * 2 + 2, top: 0 });
  for (const [x, z, w, d] of [[0, -S - 1, S * 2 + 4, 1], [0, S + 1, S * 2 + 4, 1], [-S - 1, 0, 1, S * 2 + 2], [S + 1, 0, 1, S * 2 + 2]]) levelGroup.add(box(w, 1.6, d, g.color, x, .8, z));
  const items = []; const data = cfg.items(); const pts = [];
  for (const it of shuffle(data)) {
    let x, z, n = 0; do { x = rnd(-S + 2, S - 2); z = rnd(-S + 2, S - 2); n++; } while (n < 80 && (Math.hypot(x, z) < 4 || pts.some(p => Math.hypot(p[0] - x, p[1] - z) < 4)));
    pts.push([x, z]);
    const grp = new THREE.Group(); grp.position.set(x, 0, z); levelGroup.add(grp);
    const cube = box(1, 1, 1, new THREE.MeshStandardMaterial({ color: '#7f5af0', roughness: .4, emissive: '#2a1a6a', emissiveIntensity: .4 }), 0, 1, 0); grp.add(cube);
    const lab = makeLabel(it.label, { font: 64, h: .55 }); lab.position.y = 2.3; grp.add(lab);
    items.push({ ...it, grp, cube, x, z, alive: true });
  }
  level = { type: 'collect', g, cfg, items, need: items.filter(i => i.ok).length, got: 0, wrong: 0, time: 75, done: false };
  player.pos.set(0, .1, 0); player.vy = 0; camYaw = 0; camPitch = .55; camDist = 12;
  collectHud();
}
function collectHud() {
  const L = level;
  setGameHud(`<div class="gh-top"><b>${L.g.emoji} ${L.g.name}</b><span>✅ ${L.got}/${L.need} · ❌ ${L.wrong} · ⏱ ${Math.ceil(L.time)}</span><button id="quit">✖ Keluar</button></div><div class="gh-q">${L.cfg.ins}</div>`);
  $('#quit').onclick = () => goHub(L.g.id);
}

/* ================= Modal & overlay game ================= */
const modal = $('#modal'); let modalToken = 0;
function openModal(title, color, cls = '') {
  modalToken++; modal.className = 'open ' + cls;
  modal.innerHTML = `<div class="mcard"><div class="mhead" style="background:${color || '#3d7eff'}"><span>${title}</span><button class="x">✖</button></div><div class="mbody"></div></div>`;
  modal.querySelector('.x').onclick = () => { sfx('tap'); if (mode === 'overlay' || mode === 'result') goHub(level?.g?.id || lastGame); else { closeModal(true); if (mode === 'custom' || mode === 'menu') { mode = 'hub'; camDist = 10; camPitch = .38; } } };
  return modal.querySelector('.mbody');
}
function closeModal(silent) { modalToken++; modal.className = ''; modal.innerHTML = ''; if (!silent && mode === 'overlay') mode = 'hub'; }
let lastGame = null;
function openOverlayGame(g) {
  mode = 'overlay'; lastGame = g.id; $('#hud').hidden = true;
  const body = openModal(`${g.emoji} ${g.name}`, g.color, 'game');
  const tok = modalToken;
  runOverlayGame(g, { body, sfx, alive: () => tok === modalToken, finish: (s, m) => { if (tok === modalToken) showResult(g, s, m); } });
}
function showResult(g, score, max) {
  mode = 'result'; lastGame = g.id;
  const prev = save.best[g.id]; save.stars += score; if (prev == null || score > prev) save.best[g.id] = score; persist(); hudStars();
  const p = portals.find(p => p.g.id === g.id); if (p) setPortalLabel(p);
  const ratio = max ? score / max : 0; const medal = ratio >= .9 ? '🏆' : ratio >= .6 ? '🥈' : ratio >= .3 ? '🥉' : '💪';
  const body = openModal(`${g.emoji} ${g.name}`, g.color, 'result');
  body.innerHTML = `<div class="res"><div class="medal">${medal}</div><h2>${ratio >= .9 ? 'Luar biasa!' : ratio >= .6 ? 'Hebat!' : ratio >= .3 ? 'Bagus, terus berlatih!' : 'Ayo coba lagi!'}</h2>
    <div class="score">⭐ ${score} <small>/ ${max}</small></div>
    <div class="meta2">${prev == null || score > prev ? '🎉 Rekor baru!' : 'Rekor terbaikmu: ⭐ ' + prev}</div>
    <div class="row"><button class="btn" id="again">🔁 Main Lagi</button><button class="btn ghost" id="lobby">🏠 Ke Lobi</button></div></div>`;
  sfx(ratio >= .6 ? 'win' : 'ok');
  $('#again').onclick = () => { if (g.type === 'obby' || g.type === 'collect') { closeModal(true); startGame(g); } else { openOverlayGame(g); } };
  $('#lobby').onclick = () => goHub(g.id);
  setGameHud('');
}

/* ---- Daftar game ---- */
function openList() {
  sfx('tap'); if (mode === 'hub') mode = 'menu';
  const body = openModal('🎮 Pilih Game (' + GAMES.length + ')', '#3d7eff', 'list');
  const cats = [...new Set(GAMES.map(g => g.cat))];
  body.innerHTML = `<div class="filters"><button class="chipb on" data-c="">Semua</button>${cats.map(c => `<button class="chipb" data-c="${c}">${c}</button>`).join('')}</div>
    <div class="glist">${GAMES.map(g => `<button class="gcard" data-id="${g.id}" data-c="${g.cat}" style="--c:${g.color}"><span class="ge">${g.emoji}</span><b>${g.name}</b><small>${g.cat} · ${{ obby: '3D Obby', collect: '3D Buru', quiz: 'Kuis', memory: 'Memori', sequence: 'Urutan', scramble: 'Kata', robot: 'Koding', catch: 'Arcade', typing: 'Ketik' }[g.type]}</small>${save.best[g.id] != null ? `<i>⭐ ${save.best[g.id]}</i>` : ''}</button>`).join('')}</div>`;
  body.querySelectorAll('.chipb').forEach(b => b.onclick = () => {
    body.querySelectorAll('.chipb').forEach(x => x.classList.toggle('on', x === b));
    body.querySelectorAll('.gcard').forEach(c => c.hidden = b.dataset.c && c.dataset.c !== b.dataset.c);
  });
  body.querySelectorAll('.gcard').forEach(b => b.onclick = () => { const g = GAMES.find(x => x.id === b.dataset.id); closeModal(true); mode = 'hub'; startGame(g); });
}

/* ---- Kustom karakter ---- */
const PAL = {
  skin: ['#ffdbac', '#f1c27d', '#e0ac69', '#c68642', '#8d5524', '#5c3a21'],
  shirt: ['#2f80ed', '#eb5757', '#27ae60', '#f2c94c', '#9b51e0', '#ffffff', '#222222', '#f2994a', '#56ccf2', '#ff7eb6'],
  pants: ['#27315a', '#222222', '#6d4c41', '#2d6a4f', '#7f8c8d', '#1e3799', '#ffffff', '#8e44ad'],
  hair: ['#3b2314', '#111111', '#7b4a12', '#d4a017', '#c0392b', '#ffffff', '#1e3799', '#16a085', '#ff7eb6', '#7f8c8d'],
  shoes: ['#222222', '#ffffff', '#c0392b', '#2f80ed', '#6d4c41', '#f2c94c'],
};
const LBL = { skin: 'Warna Kulit', shirt: 'Baju', pants: 'Celana', hair: 'Rambut / Peci / Kerudung', shoes: 'Sepatu' };
function openCustom() {
  sfx('tap'); const prevMode = mode; mode = 'custom';
  const body = openModal('👕 Karakterku', '#9b51e0', 'side');
  camYaw = player.rot; camPitch = .2; camDist = 6;
  const A = save.avatar;
  const render = () => {
    body.innerHTML = `<label class="fl">Nama</label><input class="tin" id="nm" maxlength="14" value="${A.name.replace(/"/g, '')}">
      <label class="fl">Gaya Kepala</label><div class="styles">${['pendek', 'panjang', 'peci', 'kerudung', 'botak'].map(s => `<button class="chipb ${A.style === s ? 'on' : ''}" data-s="${s}">${s}</button>`).join('')}</div>
      ${Object.keys(PAL).map(k => `<label class="fl">${LBL[k]}</label><div class="pal">${PAL[k].map(c => `<button class="swb ${A[k] === c ? 'on' : ''}" data-k="${k}" data-c="${c}" style="background:${c}"></button>`).join('')}</div>`).join('')}
      <div class="parts">Anggota tubuh: kepala, rambut, mata, alis, hidung, mulut, telinga, leher, badan, lengan atas, siku, lengan bawah, tangan, pinggul, paha, lutut, betis, kaki.</div>
      <div class="row"><button class="btn" id="done">✔ Simpan</button></div>`;
    body.querySelectorAll('.swb').forEach(b => b.onclick = () => { A[b.dataset.k] = b.dataset.c; avatar.apply(A); sfx('tap'); render(); });
    body.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { A.style = b.dataset.s; avatar.apply(A); sfx('tap'); render(); });
    body.querySelector('#nm').onchange = e => { A.name = e.target.value.trim() || 'Pemain'; avatar.apply(A); };
    body.querySelector('#done').onclick = () => { A.name = body.querySelector('#nm').value.trim() || 'Pemain'; avatar.apply(A); persist(); closeModal(true); mode = prevMode === 'custom' ? 'hub' : prevMode; camDist = 10; camPitch = .38; toast('Karakter disimpan!', 'good'); };
  };
  render();
}

$('#btnList').onclick = () => { if (mode === 'hub') openList(); };
$('#btnCustom').onclick = () => { if (mode === 'hub') openCustom(); };
$('#btnSound').onclick = () => { muted = !muted; $('#btnSound').textContent = muted ? '🔇' : '🔊'; };
$('#start').onclick = () => { sfx('win'); $('#intro').remove(); goHub(); };

/* ================= Loop ================= */
function findSupport(x, z, y) {
  let best = null;
  for (const p of platforms) {
    if (p.top > y + .4) continue;
    if (p.circle) { if (Math.hypot(x - p.x, z - p.z) > p.circle + .2) continue; }
    else if (Math.abs(x - p.x) > p.w / 2 + .2 || Math.abs(z - p.z) > p.d / 2 + .2) continue;
    if (!best || p.top > best.top) best = p;
  }
  return best;
}

let near = null, last = performance.now();
function update(dt, t) {
  const playing = mode === 'hub' || mode === 'obby' || mode === 'collect';
  let ix = 0, iy = 0;
  if (playing) {
    if (keys.KeyW || keys.ArrowUp) iy += 1; if (keys.KeyS || keys.ArrowDown) iy -= 1;
    if (keys.KeyD || keys.ArrowRight) ix += 1; if (keys.KeyA || keys.ArrowLeft) ix -= 1;
    ix += joyV.x; iy += joyV.y;
  } else { jumpQ = false; actQ = false; }
  const il = Math.hypot(ix, iy); if (il > 1) { ix /= il; iy /= il; }
  const fx = -Math.sin(camYaw), fz = -Math.cos(camYaw), rx = Math.cos(camYaw), rz = -Math.sin(camYaw);
  const mx = fx * iy + rx * ix, mz = fz * iy + rz * ix, ml = Math.min(1, Math.hypot(mx, mz));
  player.pos.x += mx * player.speed * dt; player.pos.z += mz * player.speed * dt;
  if (ml > .05) player.rot = lerpAngle(player.rot, Math.atan2(mx, mz), 1 - Math.pow(.00002, dt));
  if (mode === 'hub') { const d = Math.hypot(player.pos.x, player.pos.z); if (d > 72) { player.pos.x *= 72 / d; player.pos.z *= 72 / d; } }
  if (mode === 'collect') { player.pos.x = Math.max(-16.5, Math.min(16.5, player.pos.x)); player.pos.z = Math.max(-16.5, Math.min(16.5, player.pos.z)); }
  if (jumpQ && player.onGround) { player.vy = 10; player.onGround = false; sfx('jump'); }
  jumpQ = false;
  player.vy -= 26 * dt; let ny = player.pos.y + player.vy * dt;
  const sup = findSupport(player.pos.x, player.pos.z, player.pos.y);
  if (sup && ny <= sup.top && player.vy <= 0) {
    ny = sup.top; player.vy = 0;
    const landed = !player.onGround || player.support !== sup;
    player.onGround = true; player.support = sup;
    if (landed) onLand(sup);
  } else { player.onGround = false; player.support = null; }
  player.pos.y = ny;
  if (player.pos.y < -12) {
    if (mode === 'obby') { player.pos.set(0, .1, level.cur * 12); toast('Jatuh! Kembali ke checkpoint', 'bad'); }
    else player.pos.set(0, .3, 0);
    player.vy = 0;
  }

  avatar.g.position.copy(player.pos); avatar.g.rotation.y = player.rot;
  avatar.animate(dt, playing ? ml : 0, !player.onGround && mode !== 'intro');

  // kamera
  if (mode === 'intro') camYaw += dt * .25;
  const tgt = new THREE.Vector3(player.pos.x, player.pos.y + 1.7, player.pos.z);
  camera.position.set(tgt.x + Math.sin(camYaw) * Math.cos(camPitch) * camDist, tgt.y + Math.sin(camPitch) * camDist, tgt.z + Math.cos(camYaw) * Math.cos(camPitch) * camDist);
  camera.lookAt(tgt);
  sun.position.set(player.pos.x + 18, player.pos.y + 34, player.pos.z + 12); sun.target.position.copy(player.pos);

  clouds.forEach((c, i) => { c.position.x += dt * (1 + i % 3 * .5); if (c.position.x > 100) c.position.x = -100; });

  if (mode === 'hub' || mode === 'intro') {
    portals.forEach((p, i) => { p.pm.opacity = .5 + .2 * Math.sin(t * 2 + i); p.icon.position.y = 2.4 + Math.sin(t * 2 + i) * .15; });
  }
  if (mode === 'hub') {
    near = null; let nd = 3.6;
    for (const p of portals) { const d = Math.hypot(p.x - player.pos.x, p.z - player.pos.z); if (d < nd) { nd = d; near = p; } }
    const pr = $('#prompt');
    if (near) { pr.hidden = false; pr.innerHTML = `<b>${near.g.emoji} ${near.g.name}</b> <span>Tekan <kbd>E</kbd> atau MASUK</span>`; }
    else pr.hidden = true;
    document.body.classList.toggle('can-act', !!near);
    if (actQ && near) startGame(near.g);
  } else document.body.classList.remove('can-act');
  actQ = false;

  if (mode === 'obby' && level) {
    for (const f of level.falling) { f.vy -= 20 * dt; f.m.position.y += f.vy * dt; f.l.position.y += f.vy * dt; f.m.rotation.z += dt; }
  }
  if (mode === 'collect' && level && !level.done) {
    const L = level; L.time -= dt;
    for (const it of L.items) {
      if (!it.alive) continue;
      it.cube.rotation.y += dt * 1.5; it.cube.position.y = 1 + Math.sin(t * 3 + it.x) * .15;
      if (Math.hypot(it.x - player.pos.x, it.z - player.pos.z) < 1.2 && player.pos.y < 2.2) {
        it.alive = false; levelGroup.remove(it.grp); disposeTree(it.grp);
        if (it.ok) { L.got++; sfx('coin'); toast(`✅ ${it.label} benar!`, 'good'); }
        else { L.wrong++; L.time -= 5; sfx('bad'); toast(`❌ ${it.label} salah! −5 detik`, 'bad'); }
      }
    }
    if ((L._hudT = (L._hudT || 0) + dt) > .25) { L._hudT = 0; collectHud(); }
    if (L.got >= L.need || L.time <= 0) { L.done = true; const sc = Math.max(0, L.got - Math.floor(L.wrong / 2)); setTimeout(() => showResult(L.g, sc, L.need), 300); }
  }
}
function loop(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  update(dt, now / 1000); renderer.render(scene, camera); requestAnimationFrame(loop);
}

buildHub(); platforms = hubPlatforms; hudStars();
player.pos.set(0, .3, 0); camDist = 9; camPitch = .3;
requestAnimationFrame(loop);
window.__bp = { startGame: (id) => startGame(GAMES.find(g => g.id === id)), get mode() { return mode; } };
