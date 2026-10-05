// ─────────────────────────────────────────────────────────────
//  Motor del juego: bucle, movimiento, colisiones, cámara,
//  caminar tocando la pantalla, luces y cinemática final.
// ─────────────────────────────────────────────────────────────
import { TILE, MAP_W, MAP_H, createObjects, generateMap, buildArt, renderGround, propsFromMap } from './world.js';
import { buildCharacter, buildObjectSprite } from './sprites.js';

const SPEED = 74; // px por segundo
const INTERACTIVE = new Set(['sign', 'chest', 'cat', 'pedestal', 'mailbox', 'gate', 'boy']);
const SOLID_OBJ = new Set(['sign', 'chest', 'cat', 'pedestal', 'mailbox', 'lamp', 'boy', 'house', 'bigtree', 'gate']);

export class Engine {
  constructor(canvas, { colors, progress, hooks, reducedMotion }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.hooks = hooks; // onInteract(obj), onStar(idx), onNear(obj|null), onCutsceneEnd()
    this.progress = progress;
    this.reduced = reducedMotion;

    this.objects = createObjects();
    this.map = generateMap(this.objects);
    this.art = buildArt();
    this.ground = renderGround(this.map);
    this.props = propsFromMap(this.map);
    this.girl = buildCharacter('girl', colors.ella);
    this.boySpr = buildCharacter('boy', colors.yo);
    this.cat = buildObjectSprite('cat');

    const start = progress.pos ?? { x: 6 * TILE + 8, y: 25 * TILE + 12, dir: 'down' };
    this.player = { x: start.x, y: start.y, dir: start.dir, dist: 0, moving: false };
    this.keys = { up: false, down: false, left: false, right: false };
    this.path = null;
    this.pathTarget = null;
    this.paused = false;
    this.time = 0;
    this.cam = { x: 0, y: 0 };
    this.scale = 3;
    this.darkness = progress.ending ? 0.55 : 0.1;
    this.darkTarget = this.darkness;
    this.fireflies = [];
    this.petals = [];
    this.bursts = [];
    this.gateAnim = progress.gateOpen ? 1 : 0;
    this.cutscene = null;
    this.near = null;
    this.ending = progress.ending;

    for (let i = 0; i < 26; i++) this.fireflies.push(this.newFirefly());
    this.buildBlocked();
    this.resize();
  }

  // ── Colisiones ──────────────────────────────────────────────
  objRect(o) {
    const X = o.x * TILE, Y = o.y * TILE;
    switch (o.type) {
      case 'house': return [X + 8, Y + 16, o.w * TILE - 16, (o.h - 1) * TILE];
      case 'lamp': return [X + 4, Y + 6, 8, 10];
      case 'bigtree': return [X + 4, Y, 24, 16];
      case 'gate': return this.progress.gateOpen ? null : [X, Y, 32, 16];
      default: return [X + 1, Y + 2, 14, 14];
    }
  }
  buildBlocked() {
    this.blocked = new Uint8Array(MAP_W * MAP_H);
    for (let j = 0; j < MAP_H; j++)
      for (let i = 0; i < MAP_W; i++) if (this.map.isSolidTile(i, j)) this.blocked[j * MAP_W + i] = 1;
    for (const o of this.objects) {
      if (!SOLID_OBJ.has(o.type)) continue;
      const r = this.objRect(o);
      if (!r) continue;
      for (let j = Math.floor(r[1] / TILE); j <= Math.floor((r[1] + r[3] - 1) / TILE); j++)
        for (let i = Math.floor(r[0] / TILE); i <= Math.floor((r[0] + r[2] - 1) / TILE); i++)
          this.blocked[j * MAP_W + i] = 1;
    }
  }
  solidAt(x, y) {
    const i = Math.floor(x / TILE), j = Math.floor(y / TILE);
    if (i < 0 || j < 0 || i >= MAP_W || j >= MAP_H) return true;
    if (this.map.isSolidTile(i, j)) return true;
    for (const o of this.objects) {
      if (!SOLID_OBJ.has(o.type)) continue;
      const r = this.objRect(o);
      if (r && x >= r[0] && x < r[0] + r[2] && y >= r[1] && y < r[1] + r[3]) return true;
    }
    return false;
  }
  boxFree(x, y) {
    return !(this.solidAt(x - 5, y - 3) || this.solidAt(x + 5, y - 3) || this.solidAt(x - 5, y + 2) || this.solidAt(x + 5, y + 2));
  }

  // ── Cámara y tamaño ───────────────────────────────────────
  resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    // en móvil ~8-9 tiles de ancho, en escritorio ~18-22
    const target = vw < 700 ? 8.5 * TILE : 22 * TILE;
    this.scale = Math.max(2, Math.round(Math.min(vw / target, vh / (8 * TILE)) * 2) / 2);
    this.vw = Math.ceil(vw / this.scale);
    this.vh = Math.ceil(vh / this.scale);
    this.canvas.width = this.vw;
    this.canvas.height = this.vh;
    this.canvas.style.width = this.vw * this.scale + 'px';
    this.canvas.style.height = this.vh * this.scale + 'px';
    this.light = document.createElement('canvas');
    this.light.width = this.vw;
    this.light.height = this.vh;
    this.ctx.imageSmoothingEnabled = false;
    this.updateCam(true);
  }
  updateCam(snap = false) {
    const W = MAP_W * TILE, H = MAP_H * TILE;
    let fx = this.player.x, fy = this.player.y - 10;
    if (this.cutscene) {
      fx = (37 * TILE + 8 + this.player.x) / 2;
      fy = 5 * TILE;
    }
    let tx = fx - this.vw / 2, ty = fy - this.vh / 2;
    tx = W <= this.vw ? (W - this.vw) / 2 : Math.max(0, Math.min(W - this.vw, tx));
    ty = H <= this.vh ? (H - this.vh) / 2 : Math.max(0, Math.min(H - this.vh, ty));
    if (snap || this.reduced) { this.cam.x = tx; this.cam.y = ty; }
    else { this.cam.x += (tx - this.cam.x) * 0.12; this.cam.y += (ty - this.cam.y) * 0.12; }
  }

  // ── Entrada ───────────────────────────────────────────────
  setKey(dir, on) {
    this.keys[dir] = on;
    if (on) { this.path = null; this.pathTarget = null; }
  }
  clearKeys() {
    for (const k in this.keys) this.keys[k] = false;
  }
  interact() {
    if (this.paused || this.cutscene) return;
    if (this.near) this.hooks.onInteract(this.near);
  }
  objectAtWorld(wx, wy) {
    // usa el área visible del sprite, con margen generoso para dedos
    let best = null, bd = 1e9;
    for (const o of this.objects) {
      if (!INTERACTIVE.has(o.type)) continue;
      const cx = o.x * TILE + (o.w * TILE) / 2, cy = o.y * TILE + 4;
      const dx = wx - cx, dy = wy - cy;
      const d = Math.hypot(dx, dy * 0.8);
      const reach = o.type === 'boy' ? 22 : 16;
      if (d < reach && d < bd) { best = o; bd = d; }
    }
    return best;
  }
  tapAt(clientX, clientY) {
    if (this.paused || this.cutscene) return;
    const rect = this.canvas.getBoundingClientRect();
    const wx = (clientX - rect.left) / this.scale + this.cam.x;
    const wy = (clientY - rect.top) / this.scale + this.cam.y;
    const obj = this.objectAtWorld(wx, wy);
    if (obj && this.near === obj) { this.hooks.onInteract(obj); return; }
    let ti = Math.floor(wx / TILE), tj = Math.floor(wy / TILE);
    let goals;
    if (obj) {
      goals = [];
      for (let j = obj.y - 1; j <= obj.y + obj.h; j++)
        for (let i = obj.x - 1; i <= obj.x + obj.w; i++) if (!this.blockedAt(i, j)) goals.push([i, j]);
    } else if (this.blockedAt(ti, tj)) {
      goals = [];
      for (const [a, b] of [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, 1], [1, -1], [-1, -1]])
        if (!this.blockedAt(ti + a, tj + b)) goals.push([ti + a, tj + b]);
    } else goals = [[ti, tj]];
    const p = this.findPath(goals);
    if (p) {
      this.path = p;
      this.pathTarget = obj;
      this.tapMark = { x: obj ? null : ti * TILE + 8, y: tj * TILE + 8, t: 0 };
    }
  }
  blockedAt(i, j) {
    if (i < 0 || j < 0 || i >= MAP_W || j >= MAP_H) return true;
    return this.blocked[j * MAP_W + i] === 1;
  }
  findPath(goals) {
    if (!goals.length) return null;
    const si = Math.floor(this.player.x / TILE), sj = Math.floor(this.player.y / TILE);
    const goalSet = new Set(goals.map(([i, j]) => j * MAP_W + i));
    const prev = new Int32Array(MAP_W * MAP_H).fill(-1);
    const start = sj * MAP_W + si;
    prev[start] = start;
    const q = [start];
    let found = goalSet.has(start) ? start : -1;
    while (q.length && found < 0) {
      const cur = q.shift();
      const ci = cur % MAP_W, cj = (cur / MAP_W) | 0;
      for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const ni = ci + a, nj = cj + b;
        if (this.blockedAt(ni, nj)) continue;
        const n = nj * MAP_W + ni;
        if (prev[n] !== -1) continue;
        prev[n] = cur;
        if (goalSet.has(n)) { found = n; break; }
        q.push(n);
      }
    }
    if (found < 0) return null;
    const out = [];
    for (let c = found; c !== start; c = prev[c]) out.push([(c % MAP_W) * TILE + 8, ((c / MAP_W) | 0) * TILE + 10]);
    out.reverse();
    if (!out.length) out.push([si * TILE + 8, sj * TILE + 10]);
    return out;
  }

  // ── Actualización ─────────────────────────────────────────
  update(dt) {
    this.time += dt;
    const p = this.player;
    let mx = 0, my = 0;

    if (this.cutscene) this.updateCutscene(dt);
    else if (!this.paused) {
      if (this.keys.left) mx -= 1;
      if (this.keys.right) mx += 1;
      if (this.keys.up) my -= 1;
      if (this.keys.down) my += 1;
    }

    if (!this.paused && this.path && !(mx || my)) {
      const [tx, ty] = this.path[0];
      const dx = tx - p.x, dy = ty - p.y;
      const d = Math.hypot(dx, dy);
      const step = SPEED * dt * (this.cutscene ? 0.8 : 1);
      if (d <= step) {
        p.x = tx; p.y = ty;
        this.path.shift();
        if (!this.path.length) {
          this.path = null;
          const t = this.pathTarget;
          this.pathTarget = null;
          if (t) {
            this.face(t);
            if (!this.cutscene) { this.computeNear(); if (this.near === t) this.hooks.onInteract(t); }
          }
        }
      } else {
        p.x += (dx / d) * step; p.y += (dy / d) * step;
        p.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
      }
      p.dist += step;
      p.moving = true;
    } else if (mx || my) {
      const len = Math.hypot(mx, my);
      const vx = (mx / len) * SPEED * dt, vy = (my / len) * SPEED * dt;
      if (this.boxFree(p.x + vx, p.y)) p.x += vx;
      else if (!my) this.nudge(p, 0, vx);
      if (this.boxFree(p.x, p.y + vy)) p.y += vy;
      else if (!mx) this.nudge(p, vy, 0);
      p.dir = mx && Math.abs(mx) >= Math.abs(my) && !my ? (mx > 0 ? 'right' : 'left') : my ? (my > 0 ? 'down' : 'up') : p.dir;
      if (mx && !my) p.dir = mx > 0 ? 'right' : 'left';
      p.dist += SPEED * dt;
      p.moving = true;
    } else p.moving = false;

    if (!this.cutscene) {
      this.computeNear();
      this.checkStars();
    }
    this.darkness += (this.darkTarget - this.darkness) * Math.min(1, dt * 0.8);
    if (this.progress.gateOpen && this.gateAnim < 1) this.gateAnim = Math.min(1, this.gateAnim + dt * 0.7);
    this.updateParticles(dt);
    this.updateCam();
  }
  // empuja al personaje para que no se atasque en esquinas
  nudge(p, vy, vx) {
    for (const off of [3, -3, 6, -6]) {
      if (vx && this.boxFree(p.x + vx, p.y + off)) { p.y += Math.sign(off) * 0.8; return; }
      if (vy && this.boxFree(p.x + off, p.y + vy)) { p.x += Math.sign(off) * 0.8; return; }
    }
  }
  face(o) {
    const cx = o.x * TILE + (o.w * TILE) / 2, cy = o.y * TILE + 8;
    const dx = cx - this.player.x, dy = cy - this.player.y;
    this.player.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up';
  }
  computeNear() {
    const p = this.player;
    const ahead = { up: [0, -12], down: [0, 12], left: [-12, 0], right: [12, 0] }[p.dir];
    let best = null, bd = 1e9;
    for (const o of this.objects) {
      if (!INTERACTIVE.has(o.type)) continue;
      if (o.type === 'gate' && this.progress.gateOpen) continue;
      const cx = o.x * TILE + (o.w * TILE) / 2, cy = o.y * TILE + 9;
      const d = Math.hypot(cx - p.x, cy - p.y);
      const da = Math.hypot(cx - (p.x + ahead[0]), cy - (p.y + ahead[1]));
      const score = Math.min(d, da * 0.8);
      const lim = o.type === 'gate' ? 30 : 22;
      if (d < lim + 4 && score < bd) { best = o; bd = score; }
    }
    if (best !== this.near) {
      this.near = best;
      this.hooks.onNear?.(best);
    }
  }
  checkStars() {
    for (const o of this.objects) {
      if (o.type !== 'star' || this.progress.found[`estrella-${o.idx}`]) continue;
      const cx = o.x * TILE + 8, cy = o.y * TILE + 10;
      if (Math.hypot(cx - this.player.x, cy - this.player.y) < 10) {
        this.burst(cx, cy - 6, ['#fff6c2', '#ffd98a', '#ffffff'], 26);
        this.hooks.onStar(o.idx);
      }
    }
  }

  // ── Partículas ───────────────────────────────────────────
  newFirefly(x, y) {
    return {
      x: x ?? Math.random() * MAP_W * TILE,
      y: y ?? Math.random() * MAP_H * TILE,
      ph: Math.random() * 10,
      sp: 0.5 + Math.random(),
      gather: 0,
    };
  }
  burst(x, y, colors, n = 18) {
    if (this.reduced) n = Math.round(n / 3);
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 20 + Math.random() * 50;
      this.bursts.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, life: 0.9 + Math.random() * 0.5, c: colors[i % colors.length] });
    }
  }
  updateParticles(dt) {
    const cx = 36.5 * TILE + 8, cy = 5 * TILE;
    for (const f of this.fireflies) {
      f.ph += dt * f.sp;
      if (f.gather > 0) {
        const a = f.ph * 0.9 + f.sp * 6, r = 26 + Math.sin(f.ph * 2) * 6;
        const tx = cx + Math.cos(a) * r, ty = cy + Math.sin(a) * r * 0.6 - 8;
        f.x += (tx - f.x) * Math.min(1, dt * f.gather);
        f.y += (ty - f.y) * Math.min(1, dt * f.gather);
      } else {
        f.x += Math.cos(f.ph) * 8 * dt;
        f.y += Math.sin(f.ph * 1.3) * 6 * dt;
      }
    }
    for (const b of this.bursts) {
      b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 60 * dt; b.life -= dt;
    }
    this.bursts = this.bursts.filter((b) => b.life > 0);
    if (this.ending && !this.reduced && this.petals.length < 60 && Math.random() < 0.5) {
      this.petals.push({ x: this.cam.x + Math.random() * this.vw * 1.2, y: this.cam.y - 8, vx: -10 - Math.random() * 14, vy: 12 + Math.random() * 14, ph: Math.random() * 6 });
    }
    for (const pt of this.petals) { pt.ph += dt * 3; pt.x += (pt.vx + Math.sin(pt.ph) * 10) * dt; pt.y += pt.vy * dt; }
    this.petals = this.petals.filter((pt) => pt.y < this.cam.y + this.vh + 10);
    if (this.tapMark) { this.tapMark.t += dt; if (this.tapMark.t > 0.6) this.tapMark = null; }
  }

  // ── Puerta y final ──────────────────────────────────────
  openGate() {
    this.progress.gateOpen = true;
    this.buildBlocked();
    this.burst(37 * TILE, 9 * TILE + 4, ['#ffd1e1', '#fff6c2', '#c9b6ff'], 40);
  }
  startEnding() {
    this.cutscene = { t: 0, phase: 0 };
    this.clearKeys();
    this.path = this.findPath([[36, 5]]);
    this.pathTarget = null;
  }
  updateCutscene(dt) {
    const c = this.cutscene;
    c.t += dt;
    if (c.phase === 0 && !this.path) {
      this.player.dir = 'right';
      c.phase = 1; c.t = 0;
      this.darkTarget = 0.62;
      this.ending = true;
      this.hooks.onCutscenePhase?.(1);
    }
    if (c.phase === 1) {
      const n = this.fireflies.length;
      this.fireflies.forEach((f, i) => { if (c.t > (i / n) * 2) f.gather = 1.4; });
      if (c.t > 2.6) {
        c.phase = 2; c.t = 0;
        this.heart = 0;
        this.burst(36.5 * TILE + 8, 4 * TILE, ['#ffd1e1', '#ff8fb1', '#fff6c2', '#ffffff'], 50);
        this.hooks.onCutscenePhase?.(2);
      }
    }
    if (c.phase === 2) {
      this.heart = c.t;
      if (c.t > 2.4) {
        c.phase = 3;
        this.hooks.onCutsceneEnd?.();
      }
    }
  }
  endCutscene() {
    this.cutscene = null;
    this.fireflies.forEach((f) => (f.gather = 0));
    this.heart = null;
  }

  // ── Dibujo ─────────────────────────────────────────────
  draw() {
    const ctx = this.ctx;
    const cx = Math.round(this.cam.x), cy = Math.round(this.cam.y);
    ctx.fillStyle = '#2f5a2c';
    ctx.fillRect(0, 0, this.vw, this.vh);
    ctx.drawImage(this.ground, -cx, -cy);
    this.drawWater(cx, cy);

    // marca del toque
    if (this.tapMark && this.tapMark.x != null) {
      const k = this.tapMark.t / 0.6;
      ctx.strokeStyle = `rgba(255,255,255,${0.8 * (1 - k)})`;
      ctx.lineWidth = 1;
      const r = 3 + k * 5;
      ctx.strokeRect(Math.round(this.tapMark.x - r - cx) + 0.5, Math.round(this.tapMark.y - r * 0.6 - cy) + 0.5, Math.round(r * 2), Math.round(r * 1.2));
    }

    // lista ordenada por profundidad
    const list = [];
    const inView = (x, y) => x > cx - 80 && x < cx + this.vw + 80 && y > cy - 40 && y < cy + this.vh + 100;
    for (const pr of this.props) {
      const bx = pr.x * TILE + 8, by = (pr.y + 1) * TILE;
      if (inView(bx, by)) list.push({ y: by, d: () => this.drawProp(pr, cx, cy) });
    }
    for (const o of this.objects) {
      const by = (o.y + o.h) * TILE - (o.type === 'gate' ? 4 : 0);
      if (o.type === 'star') continue;
      if (inView(o.x * TILE, by)) list.push({ y: by, d: () => this.drawObject(o, cx, cy) });
    }
    list.push({ y: this.player.y + 2, d: () => this.drawPlayer(cx, cy) });
    list.sort((a, b) => a.y - b.y);
    for (const it of list) it.d();

    for (const o of this.objects) if (o.type === 'star') this.drawStar(o, cx, cy);

    // partículas
    for (const b of this.bursts) {
      ctx.globalAlpha = Math.max(0, Math.min(1, b.life));
      ctx.fillStyle = b.c;
      ctx.fillRect(Math.round(b.x - cx), Math.round(b.y - cy), 2, 2);
    }
    ctx.globalAlpha = 1;
    for (const pt of this.petals) {
      ctx.fillStyle = Math.sin(pt.ph) > 0 ? '#ffc6dc' : '#f093b8';
      ctx.fillRect(Math.round(pt.x - cx), Math.round(pt.y - cy), 2, Math.sin(pt.ph) > 0 ? 2 : 1);
    }

    this.drawLighting(cx, cy);
    this.drawIndicators(cx, cy);
    if (this.heart != null) this.drawHeart(cx, cy);
  }

  drawWater(cx, cy) {
    const ctx = this.ctx;
    const t = this.time;
    ctx.fillStyle = '#9fdcf7';
    const i0 = Math.max(0, Math.floor(cx / TILE)), i1 = Math.min(MAP_W - 1, Math.ceil((cx + this.vw) / TILE));
    const j0 = Math.max(0, Math.floor(cy / TILE)), j1 = Math.min(MAP_H - 1, Math.ceil((cy + this.vh) / TILE));
    for (let j = j0; j <= j1; j++)
      for (let i = i0; i <= i1; i++) {
        if (this.map.get(i, j) !== 2) continue;
        const ph = Math.sin(t * 1.6 + i * 1.7 + j * 2.3);
        if (ph > 0.2) {
          const ox = ((i * 5 + j * 3) % 9) + Math.round(ph * 2);
          ctx.fillRect(i * TILE + ox - cx, j * TILE + 6 + ((i + j) % 3) * 2 - cy, 4, 1);
        }
      }
  }
  drawProp(pr, cx, cy) {
    const a = this.art;
    const X = pr.x * TILE - cx, Y = pr.y * TILE - cy;
    if (pr.kind === 'tree') {
      const sway = this.reduced ? 0 : Math.round(Math.sin(this.time * 0.8 + pr.x) * 0.6);
      this.ctx.drawImage(a.tree, X - 8 + sway, Y + TILE - 38);
    } else if (pr.kind === 'bush') this.ctx.drawImage(a.bush, X, Y);
    else this.ctx.drawImage(a.rock, X, Y);
  }
  drawObject(o, cx, cy) {
    const ctx = this.ctx, a = this.art;
    const X = o.x * TILE - cx, Y = o.y * TILE - cy;
    const bottom = (img) => Y + TILE - img.height;
    switch (o.type) {
      case 'house': ctx.drawImage(a.house, X, (o.y + o.h) * TILE - cy - a.house.height); break;
      case 'bigtree': ctx.drawImage(a.bigtree, X + 16 - a.bigtree.width / 2, Y + TILE - a.bigtree.height + 4); break;
      case 'sign': ctx.drawImage(a.sign, X, bottom(a.sign)); break;
      case 'mailbox': ctx.drawImage(a.mailbox, X, bottom(a.mailbox)); break;
      case 'pedestal': ctx.drawImage(a.pedestal, X, bottom(a.pedestal)); break;
      case 'lamp': ctx.drawImage(a.lamp, X, bottom(a.lamp)); break;
      case 'chest': {
        const open = this.progress.found[o.id];
        ctx.drawImage(open ? a.chestOpen : a.chest, X, Y);
        break;
      }
      case 'gate': {
        if (this.gateAnim >= 1) break;
        const k = this.gateAnim;
        ctx.globalAlpha = 1 - k;
        const sink = Math.round(k * 14);
        ctx.drawImage(a.gate, 0, 0, 32, 24 - sink, X, Y - 8 + sink, 32, 24 - sink);
        ctx.globalAlpha = 1;
        break;
      }
      case 'cat': {
        const hop = !this.reduced && Math.sin(this.time * 2.2) > 0.92 ? -1 : 0;
        ctx.fillStyle = 'rgba(0,0,0,0.22)';
        ctx.fillRect(X + 3, Y + 14, 10, 2);
        ctx.drawImage(this.cat, X, Y + hop);
        break;
      }
      case 'boy': {
        const s = this.boySpr;
        let dir = 'down';
        if (this.cutscene && this.cutscene.phase >= 1) dir = 'left';
        const bob = !this.reduced && !this.cutscene && Math.sin(this.time * 3) > 0.85 ? -1 : 0;
        const bx = X, by = Y + TILE - s.h + 1;
        ctx.fillStyle = 'rgba(0,0,0,0.25)';
        ctx.fillRect(bx + 3, Y + TILE - 1, 10, 2);
        ctx.drawImage(s[dir][0], bx, by + bob);
        break;
      }
    }
  }
  drawPlayer(cx, cy) {
    const p = this.player, s = this.girl, ctx = this.ctx;
    const frame = p.moving ? Math.floor(p.dist / 7) % 4 : 0;
    const x = Math.round(p.x - s.w / 2 - cx), y = Math.round(p.y + 3 - s.h - cy);
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(x + 3, Math.round(p.y + 1 - cy), 10, 2);
    ctx.drawImage(s[p.dir][frame], x, y);
  }
  drawStar(o, cx, cy) {
    if (this.progress.found[`estrella-${o.idx}`]) return;
    const ctx = this.ctx;
    const period = 3.2;
    const t = (this.time + o.idx * 1.1) % period;
    const X = o.x * TILE + 8 - cx, Y = o.y * TILE + 6 - cy;
    // destello muy sutil, casi todo el tiempo invisible
    const k = t < 0.6 ? Math.sin((t / 0.6) * Math.PI) : 0;
    ctx.fillStyle = 'rgba(255,250,210,0.35)';
    ctx.fillRect(X, Y, 1, 1);
    if (k > 0) {
      const r = Math.round(1 + k * 3);
      ctx.fillStyle = `rgba(255,250,210,${0.9 * k})`;
      ctx.fillRect(X - r, Y, r * 2 + 1, 1);
      ctx.fillRect(X, Y - r, 1, r * 2 + 1);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(X, Y, 1, 1);
    }
  }
  drawIndicators(cx, cy) {
    const ctx = this.ctx;
    if (this.cutscene) return;
    for (const o of this.objects) {
      if (!INTERACTIVE.has(o.type)) continue;
      if (o.type === 'gate' && this.progress.gateOpen) continue;
      const done =
        (o.type === 'sign' || o.type === 'chest') ? this.progress.found[o.id] :
        o.type === 'cat' ? this.progress.quiz :
        o.type === 'pedestal' ? this.progress.puzzle : o.type === 'mailbox' || o.type === 'gate';
      const isNear = this.near === o;
      if (done && !isNear) continue;
      const X = o.x * TILE + (o.w * TILE) / 2 - cx;
      const top = { boy: 26, lamp: 32, pedestal: 20, mailbox: 20, sign: 18, gate: 10 }[o.type] ?? 16;
      const bob = this.reduced ? 0 : Math.round(Math.sin(this.time * 4 + o.x) * 1.5);
      const Y = o.y * TILE + TILE - top - 7 - cy + bob;
      if (isNear) {
        // burbuja "!"
        ctx.fillStyle = '#2a1b2d';
        ctx.fillRect(X - 4, Y - 6, 9, 9);
        ctx.fillStyle = '#fff8ef';
        ctx.fillRect(X - 3, Y - 5, 7, 7);
        ctx.fillStyle = '#e85a7a';
        ctx.fillRect(X, Y - 4, 1, 3);
        ctx.fillRect(X, Y, 1, 1);
        ctx.fillStyle = '#2a1b2d';
        ctx.fillRect(X - 1, Y + 3, 3, 1);
      } else {
        // pequeño brillo
        const a = 0.55 + Math.sin(this.time * 3 + o.y) * 0.35;
        ctx.fillStyle = `rgba(255,236,170,${a})`;
        ctx.fillRect(X, Y - 3, 1, 5);
        ctx.fillRect(X - 2, Y - 1, 5, 1);
        ctx.fillStyle = `rgba(255,255,255,${a})`;
        ctx.fillRect(X, Y - 1, 1, 1);
      }
    }
  }
  drawHeart(cx, cy) {
    const ctx = this.ctx;
    const k = Math.min(1, this.heart / 0.4);
    const X = Math.round(36.5 * TILE + 8 - cx), Y = Math.round(5 * TILE - 34 - cy - this.heart * 3);
    const rows = ['.KK.KK.', 'KRRKRRK', 'KRWRRRK', 'KRRRRRK', '.KRRRK.', '..KRK..', '...K...'];
    const pal = { K: '#2a1b2d', R: '#ff6f91', W: '#ffd1e1' };
    ctx.globalAlpha = k;
    rows.forEach((r, j) => [...r].forEach((ch, i) => { if (pal[ch]) { ctx.fillStyle = pal[ch]; ctx.fillRect(X - 3 + i, Y + j, 1, 1); } }));
    ctx.globalAlpha = 1;
  }
  drawLighting(cx, cy) {
    const ctx = this.ctx;
    const d = this.darkness;
    const lights = [];
    for (const o of this.objects) {
      if (o.type === 'lamp') lights.push([o.x * TILE + 8, o.y * TILE - 4, 34, '255,214,140']);
      if (o.type === 'house') {
        lights.push([o.x * TILE + 24, o.y * TILE + 50, 22, '255,214,140']);
        lights.push([o.x * TILE + 74, o.y * TILE + 50, 22, '255,214,140']);
      }
      if (o.type === 'pedestal') lights.push([o.x * TILE + 8, o.y * TILE + 2, 16, '140,224,255']);
    }
    lights.push([this.player.x, this.player.y - 10, 30, '255,240,220']);
    for (const f of this.fireflies) lights.push([f.x, f.y, 7, '255,250,170']);

    if (d > 0.02) {
      const l = this.light, lx = l.getContext('2d');
      lx.globalCompositeOperation = 'source-over';
      lx.clearRect(0, 0, l.width, l.height);
      lx.fillStyle = `rgba(28,22,72,${d})`;
      lx.fillRect(0, 0, l.width, l.height);
      lx.globalCompositeOperation = 'destination-out';
      for (const [x, y, r] of lights) {
        const X = x - cx, Y = y - cy;
        if (X < -r || Y < -r || X > this.vw + r || Y > this.vh + r) continue;
        const g = lx.createRadialGradient(X, Y, 0, X, Y, r);
        g.addColorStop(0, 'rgba(0,0,0,0.85)');
        g.addColorStop(1, 'rgba(0,0,0,0)');
        lx.fillStyle = g;
        lx.fillRect(X - r, Y - r, r * 2, r * 2);
      }
      ctx.drawImage(l, 0, 0);
    }
    // brillo cálido aditivo
    ctx.globalCompositeOperation = 'lighter';
    const glow = Math.max(0.12, d * 0.6);
    for (const [x, y, r, c] of lights) {
      const X = x - cx, Y = y - cy;
      if (X < -r || Y < -r || X > this.vw + r || Y > this.vh + r) continue;
      if (r === 30) continue; // la luz del jugador no brilla
      const g = ctx.createRadialGradient(X, Y, 0, X, Y, r * 0.7);
      g.addColorStop(0, `rgba(${c},${r < 10 ? Math.min(0.9, 0.15 + d) : glow})`);
      g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(X - r, Y - r, r * 2, r * 2);
    }
    ctx.globalCompositeOperation = 'source-over';
    // luciérnagas
    for (const f of this.fireflies) {
      const a = 0.4 + Math.sin(f.ph * 3) * 0.4 + (f.gather ? 0.3 : 0);
      ctx.fillStyle = `rgba(255,250,190,${Math.max(0.1, Math.min(1, a))})`;
      ctx.fillRect(Math.round(f.x - cx), Math.round(f.y - cy), 1, 1);
    }
  }

  // ── Bucle ───────────────────────────────────────────────
  start() {
    let last = performance.now();
    const loop = (now) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(loop);
    };
    this.raf = requestAnimationFrame(loop);
  }
  stop() {
    cancelAnimationFrame(this.raf);
  }
  savePos() {
    this.progress.pos = { x: Math.round(this.player.x), y: Math.round(this.player.y), dir: this.player.dir };
  }
}
