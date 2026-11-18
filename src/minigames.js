import { QGEN, MEMORY, SEQ, SCRAMBLE, TYPING, ROBOT, shuffle, pick, rnd } from './data.js';

const wait = (ms) => new Promise(r => setTimeout(r, ms));
const shake = (el) => { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); };

// ctx: {body, finish(score,max), sfx, alive()}
export function runOverlayGame(game, ctx) {
  const fn = { quiz, memory, sequence, scramble, robot, catch: catchGame, typing }[game.type];
  fn(game, ctx);
}

/* ---------- Kuis pilihan ganda ---------- */
function quiz(game, { body, finish, sfx, alive }) {
  const N = 10; let i = 0, score = 0;
  const next = () => {
    if (!alive()) return;
    if (i >= N) return finish(score, N);
    const q = QGEN[game.gen]();
    const opts = shuffle([q.a, ...q.wrong.slice(0, 3)]);
    body.innerHTML = `
      <div class="prog"><div style="width:${i / N * 100}%"></div></div>
      <div class="meta">Soal ${i + 1} / ${N} <span>⭐ ${score}</span></div>
      <div class="qbox">${q.svg || ''}${q.big ? `<div class="big">${q.big}</div>` : ''}<div class="qtext">${q.q}</div></div>
      <div class="opts">${opts.map(o => `<button class="opt ${q.arabOpt ? 'arab' : ''}">${o}</button>`).join('')}</div>`;
    body.querySelectorAll('.opt').forEach(b => b.onclick = async () => {
      body.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.textContent === q.a) x.classList.add('good'); });
      if (b.textContent === q.a) { score++; sfx('ok'); } else { b.classList.add('bad'); sfx('bad'); }
      await wait(900); i++; next();
    });
  };
  next();
}

/* ---------- Memori ---------- */
function memory(game, { body, finish, sfx, alive }) {
  const pairs = pick(MEMORY[game.set], 6);
  const cards = shuffle(pairs.flatMap((p, k) => [{ k, t: p[0] }, { k, t: p[1] }]));
  let open = [], moves = 0, matched = 0, lock = false;
  body.innerHTML = `<div class="meta">Cocokkan pasangannya! <span id="mv">Langkah: 0</span></div>
    <div class="mem">${cards.map((c, i) => `<button class="card" data-i="${i}"><div class="front">?</div><div class="back">${c.t}</div></button>`).join('')}</div>`;
  const els = body.querySelectorAll('.card');
  els.forEach(el => el.onclick = async () => {
    if (lock || el.classList.contains('flip')) return;
    el.classList.add('flip'); sfx('tap'); open.push(el);
    if (open.length < 2) return;
    moves++; body.querySelector('#mv').textContent = 'Langkah: ' + moves;
    const [a, b] = open; open = [];
    if (cards[a.dataset.i].k === cards[b.dataset.i].k) {
      a.classList.add('done'); b.classList.add('done'); matched++; sfx('ok');
      if (matched === 6) { await wait(700); if (alive()) finish(Math.max(1, Math.min(10, 16 - moves)), 10); }
    } else { lock = true; sfx('bad'); await wait(800); a.classList.remove('flip'); b.classList.remove('flip'); lock = false; }
  });
}

/* ---------- Urutan ---------- */
function sequence(game, { body, finish, sfx }) {
  const cfg = SEQ[game.set]; const order = cfg.items(); let idx = 0, mistakes = 0;
  body.innerHTML = `<div class="meta">${cfg.ins} <span id="mk">Salah: 0</span></div>
    <div class="seqdone"></div><div class="seq">${shuffle(order).map(t => `<button class="opt sm">${t}</button>`).join('')}</div>`;
  const done = body.querySelector('.seqdone');
  body.querySelectorAll('.seq .opt').forEach(b => b.onclick = () => {
    if (b.textContent === order[idx]) {
      b.disabled = true; b.classList.add('good'); sfx('ok');
      done.insertAdjacentHTML('beforeend', `<span class="chip">${idx + 1}. ${order[idx]}</span>`); idx++;
      if (idx === order.length) setTimeout(() => finish(Math.max(0, order.length - mistakes), order.length), 600);
    } else { mistakes++; sfx('bad'); shake(b); body.querySelector('#mk').textContent = 'Salah: ' + mistakes; }
  });
}

/* ---------- Susun kata ---------- */
function scramble(game, { body, finish, sfx, alive }) {
  const words = pick(SCRAMBLE, 8); let i = 0, score = 0;
  const next = () => {
    if (!alive()) return;
    if (i >= words.length) return finish(score, words.length);
    const [w, hint] = words[i]; let letters = shuffle(w.split('').map((c, k) => ({ c, k })));
    if (letters.map(l => l.c).join('') === w) letters = letters.reverse();
    let built = [];
    const render = () => {
      body.innerHTML = `<div class="prog"><div style="width:${i / words.length * 100}%"></div></div>
        <div class="meta">Kata ${i + 1} / ${words.length} <span>⭐ ${score}</span></div>
        <div class="qbox"><div class="qtext">💡 ${hint}</div>
        <div class="slots">${w.split('').map((_, k) => `<span class="slot">${built[k] ? built[k].c : ''}</span>`).join('')}</div></div>
        <div class="letters">${letters.map((l, k) => `<button class="let" data-k="${k}" ${built.includes(l) ? 'disabled' : ''}>${l.c}</button>`).join('')}</div>
        <div class="row"><button class="btn ghost" id="undo">⌫ Hapus</button><button class="btn ghost" id="skip">Lewati ⏭</button></div>`;
      body.querySelectorAll('.let').forEach(b => b.onclick = () => { built.push(letters[b.dataset.k]); sfx('tap'); check(); });
      body.querySelector('#undo').onclick = () => { built.pop(); render(); };
      body.querySelector('#skip').onclick = () => { i++; next(); };
    };
    const check = async () => {
      render();
      if (built.length < w.length) return;
      if (built.map(l => l.c).join('') === w) { score++; sfx('ok'); body.querySelector('.slots').classList.add('win'); await wait(800); i++; next(); }
      else { sfx('bad'); shake(body.querySelector('.slots')); await wait(600); built = []; render(); }
    };
    render();
  };
  next();
}

/* ---------- Robot koding ---------- */
function robot(game, { body, finish, sfx, alive }) {
  let lv = 0, solved = 0;
  const DIRS = { '⬆️': [0, -1], '⬇️': [0, 1], '⬅️': [-1, 0], '➡️': [1, 0] };
  const load = () => {
    if (!alive()) return;
    if (lv >= ROBOT.length) return finish(solved, ROBOT.length);
    const map = ROBOT[lv]; let start, goal; let prog = []; let running = false;
    map.forEach((row, y) => row.split('').forEach((c, x) => { if (c === 'R') start = [x, y]; if (c === 'G') goal = [x, y]; }));
    let pos = start.slice();
    const draw = (msg = '') => {
      body.innerHTML = `<div class="meta">Level ${lv + 1} / ${ROBOT.length} <span>⭐ ${solved}</span></div>
        <div class="qtext small">Susun perintah agar 🤖 sampai ke ⭐. Hindari tembok 🧱.</div>
        <div class="grid6">${map.map((row, y) => row.split('').map((c, x) => {
          const r = pos[0] === x && pos[1] === y;
          return `<div class="cell ${c === '#' ? 'wall' : ''}">${r ? '🤖' : c === 'G' ? '⭐' : c === '#' ? '🧱' : ''}</div>`;
        }).join('')).join('')}</div>
        <div class="prog-cmds">${prog.length ? prog.map((p, k) => `<span class="cmd" data-k="${k}">${p}</span>`).join('') : '<i>Program kosong</i>'}</div>
        <div class="msg">${msg}</div>
        <div class="row">${Object.keys(DIRS).map(d => `<button class="btn dir" data-d="${d}">${d}</button>`).join('')}</div>
        <div class="row"><button class="btn ghost" id="clr">🗑️ Hapus</button><button class="btn" id="run">▶ Jalankan</button><button class="btn ghost" id="skip">Lewati</button></div>`;
      body.querySelectorAll('.dir').forEach(b => b.onclick = () => { if (running || prog.length >= 24) return; prog.push(b.dataset.d); sfx('tap'); draw(); });
      body.querySelectorAll('.cmd').forEach(c => c.onclick = () => { if (running) return; prog.splice(+c.dataset.k, 1); draw(); });
      body.querySelector('#clr').onclick = () => { if (!running) { prog = []; draw(); } };
      body.querySelector('#skip').onclick = () => { if (!running) { lv++; load(); } };
      body.querySelector('#run').onclick = run;
    };
    const run = async () => {
      if (running || !prog.length) return; running = true; pos = start.slice(); draw();
      for (const p of prog) {
        await wait(330); if (!alive()) return;
        const [dx, dy] = DIRS[p]; const nx = pos[0] + dx, ny = pos[1] + dy;
        if (nx < 0 || ny < 0 || nx > 5 || ny > 5 || map[ny][nx] === '#') { sfx('bad'); running = false; pos = start.slice(); return draw('💥 Robot menabrak! Coba lagi.'); }
        pos = [nx, ny]; sfx('tap'); draw();
        if (nx === goal[0] && ny === goal[1]) { sfx('win'); solved++; draw('🎉 Berhasil!'); await wait(900); lv++; return load(); }
      }
      sfx('bad'); running = false; pos = start.slice(); draw('🤔 Robot belum sampai bintang. Tambah perintah!');
    };
    draw();
  };
  load();
}

/* ---------- Tangkap jawaban (canvas) ---------- */
function catchGame(game, { body, finish, sfx, alive }) {
  body.innerHTML = `<div class="meta"><b id="cq"></b><span id="cs"></span></div><canvas id="cv"></canvas><div class="qtext small">Geser mouse / jari, atau pakai panah ⬅️➡️. Tangkap jawaban yang benar!</div>`;
  const cv = body.querySelector('#cv'); const W = Math.min(560, body.clientWidth - 4), H = Math.round(W * 0.72);
  const dpr = Math.min(2, devicePixelRatio || 1); cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + 'px'; cv.style.height = H + 'px';
  const g = cv.getContext('2d'); g.scale(dpr, dpr);
  let px = W / 2, score = 0, lives = 3, time = 60, items = [], spawnT = 0, q, keys = {};
  const newQ = () => { const a = rnd(1, 12), b = rnd(1, 9), m = Math.random() < .5; q = m ? { t: `${a} + ${b}`, a: a + b } : { t: `${a + b} − ${b}`, a: a }; };
  newQ();
  const mv = (e) => { const r = cv.getBoundingClientRect(); px = Math.max(30, Math.min(W - 30, (e.clientX - r.left))); };
  cv.addEventListener('pointermove', mv); cv.addEventListener('pointerdown', mv);
  const kd = e => keys[e.code] = true, ku = e => keys[e.code] = false;
  addEventListener('keydown', kd); addEventListener('keyup', ku);
  let last = performance.now(), ended = false;
  const end = () => { if (ended) return; ended = true; removeEventListener('keydown', kd); removeEventListener('keyup', ku); if (alive()) finish(Math.min(score, 15), 15); };
  const frame = (now) => {
    if (!alive() || ended) { removeEventListener('keydown', kd); removeEventListener('keyup', ku); return; }
    const dt = Math.min(.05, (now - last) / 1000); last = now; time -= dt;
    if (keys.ArrowLeft || keys.KeyA) px -= 380 * dt; if (keys.ArrowRight || keys.KeyD) px += 380 * dt; px = Math.max(30, Math.min(W - 30, px));
    spawnT -= dt;
    if (spawnT <= 0) {
      spawnT = .75; const ok = Math.random() < .35 || !items.some(i => i.v === q.a);
      let v = ok ? q.a : q.a + (rnd(1, 5) * (Math.random() < .5 ? -1 : 1)); if (v < 0) v = q.a + rnd(1, 4);
      items.push({ x: rnd(25, W - 25), y: -20, v, sp: 90 + score * 6 + rnd(0, 40) });
    }
    for (const it of items) {
      it.y += it.sp * dt;
      if (!it.hit && it.y > H - 58 && it.y < H - 20 && Math.abs(it.x - px) < 46) {
        it.hit = true;
        if (it.v === q.a) { score++; sfx('coin'); newQ(); items.forEach(o => o.hit = o.hit || false); }
        else { lives--; sfx('bad'); }
      }
    }
    items = items.filter(i => !i.hit && i.y < H + 30);
    // gambar
    const grd = g.createLinearGradient(0, 0, 0, H); grd.addColorStop(0, '#9be7ff'); grd.addColorStop(1, '#e6fbff');
    g.fillStyle = grd; g.fillRect(0, 0, W, H); g.fillStyle = '#6ac46a'; g.fillRect(0, H - 14, W, 14);
    for (const it of items) {
      g.fillStyle = '#ff9f43'; g.beginPath(); g.arc(it.x, it.y, 22, 0, 7); g.fill(); g.lineWidth = 3; g.strokeStyle = '#b35900'; g.stroke();
      g.fillStyle = '#fff'; g.font = '800 18px system-ui'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(it.v, it.x, it.y + 1);
    }
    // keranjang
    g.fillStyle = '#8d5a2b'; g.beginPath(); g.moveTo(px - 44, H - 52); g.lineTo(px + 44, H - 52); g.lineTo(px + 34, H - 16); g.lineTo(px - 34, H - 16); g.closePath(); g.fill();
    g.strokeStyle = '#5e3a17'; g.lineWidth = 3; for (let k = -30; k <= 30; k += 15) { g.beginPath(); g.moveTo(px + k, H - 50); g.lineTo(px + k * .8, H - 18); g.stroke(); }
    body.querySelector('#cq').textContent = `${q.t} = ?`;
    body.querySelector('#cs').textContent = `⭐ ${score}   ${'❤️'.repeat(Math.max(0, lives))}   ⏱ ${Math.ceil(time)}`;
    if (lives <= 0 || time <= 0) return end();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/* ---------- Ketik cepat ---------- */
function typing(game, { body, finish, sfx, alive }) {
  let words = shuffle(TYPING), i = 0, score = 0, time = 60;
  body.innerHTML = `<div class="meta">Ketik kata secepatnya! <span id="ts"></span></div>
    <div class="qbox"><div class="big word" id="tw"></div></div>
    <input id="ti" class="tin" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="ketik di sini...">`;
  const tw = body.querySelector('#tw'), ti = body.querySelector('#ti'), ts = body.querySelector('#ts');
  const show = () => { tw.textContent = words[i % words.length]; ts.textContent = `⭐ ${score}   ⏱ ${Math.ceil(time)}`; };
  show(); setTimeout(() => ti.focus(), 100);
  ti.oninput = () => {
    const target = words[i % words.length]; const v = ti.value.toLowerCase();
    tw.classList.toggle('err', !target.startsWith(v.trim()) && v.length > 0);
    if (v.trim() === target) { score++; i++; ti.value = ''; sfx('coin'); show(); }
  };
  const iv = setInterval(() => {
    if (!alive()) return clearInterval(iv);
    time -= 1; show();
    if (time <= 0) { clearInterval(iv); finish(Math.min(score, 20), 20); }
  }, 1000);
}
