// ─────────────────────────────────────────────────────────────
//  El mundo: mapa de tiles, objetos y todo el arte del escenario.
//  Todo se dibuja en código (sin imágenes externas).
// ─────────────────────────────────────────────────────────────
import { config } from '../../config.js';

export const TILE = 16;
export const MAP_W = 44;
export const MAP_H = 34;

// Tipos de tile
export const G = 0; // pasto
export const P = 1; // camino
export const W = 2; // agua
export const BR = 3; // puente
export const TR = 4; // árbol (tronco bloquea)
export const BU = 5; // arbusto
export const RK = 6; // roca
export const HE = 7; // seto
export const FL = 8; // flores (decorativo, caminable)

const SOLID = new Set([W, TR, BU, RK, HE]);

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ── Objetos del mundo (coordenadas en tiles) ─────────────────────
export function createObjects() {
  const L = config.letreros;
  const C = config.cofres;
  const objs = [
    { type: 'house', x: 3, y: 19, w: 6, h: 5 },
    { type: 'mailbox', x: 3, y: 25, label: 'Buzón' },
    { type: 'sign', x: 9, y: 26, data: L[0] },
    { type: 'sign', x: 15, y: 11, data: L[1] },
    { type: 'sign', x: 20, y: 19, data: L[2] },
    { type: 'sign', x: 29, y: 22, data: L[3] },
    { type: 'sign', x: 34, y: 11, data: L[4] },
    { type: 'chest', x: 11, y: 24, data: C[0] },
    { type: 'chest', x: 6, y: 15, data: C[1] },
    { type: 'chest', x: 37, y: 22, data: C[2] },
    { type: 'cat', x: 9, y: 24, label: config.pregunta.npc },
    { type: 'pedestal', x: 27, y: 26, label: 'Pedestal antiguo' },
    { type: 'star', x: 10, y: 18, idx: 0 },
    { type: 'star', x: 33, y: 27, idx: 1 },
    { type: 'star', x: 26, y: 7, idx: 2 },
    { type: 'gate', x: 36, y: 9, w: 2, h: 1, label: 'Cerca de flores' },
    { type: 'boy', x: 37, y: 5, label: config.yo },
    { type: 'bigtree', x: 39, y: 4 },
    { type: 'lamp', x: 8, y: 28 },
    { type: 'lamp', x: 18, y: 22 },
    { type: 'lamp', x: 18, y: 14 },
    { type: 'lamp', x: 25, y: 15 },
    { type: 'lamp', x: 32, y: 15 },
    { type: 'lamp', x: 33, y: 8 },
    { type: 'lamp', x: 40, y: 8 },
  ];
  // límites en px para clicks/colisión
  for (const o of objs) {
    o.w ??= 1;
    o.h ??= 1;
    o.id = o.data?.id ?? `${o.type}-${o.x}-${o.y}`;
  }
  return objs;
}

// ── Generación del mapa ────────────────────────────────────────
export function generateMap(objects) {
  const m = new Uint8Array(MAP_W * MAP_H); // todo pasto
  const set = (x, y, t) => {
    if (x >= 0 && y >= 0 && x < MAP_W && y < MAP_H) m[y * MAP_W + x] = t;
  };
  const get = (x, y) => (x < 0 || y < 0 || x >= MAP_W || y >= MAP_H ? TR : m[y * MAP_W + x]);
  const rect = (x1, y1, x2, y2, t) => {
    for (let y = Math.min(y1, y2); y <= Math.max(y1, y2); y++)
      for (let x = Math.min(x1, x2); x <= Math.max(x1, x2); x++) set(x, y, t);
  };

  // río vertical
  for (let y = 0; y < MAP_H; y++) {
    const wob = Math.round(Math.sin(y * 0.45) * 0.8);
    rect(22 + wob, y, 23 + wob, y, W);
  }
  // estanque
  for (let y = 7; y <= 14; y++)
    for (let x = 4; x <= 13; x++) {
      const dx = (x - 8.4) / 4.6, dy = (y - 10.6) / 3.3;
      if (dx * dx + dy * dy < 1) set(x, y, W);
    }

  // camino principal (2 tiles de ancho)
  const path = [
    [6, 24, 7, 28], // salida de casa
    [6, 27, 17, 28],
    [16, 12, 17, 28],
    [12, 12, 17, 13], // al estanque
    [16, 16, 32, 17], // al puente
    [26, 16, 27, 25], // al pedestal
    [25, 25, 29, 27],
    [31, 9, 32, 17],
    [31, 9, 37, 10],
    [36, 3, 37, 10], // claro final
  ];
  for (const [a, b, c, d] of path) rect(a, b, c, d, P);
  // puente
  for (let y = 16; y <= 17; y++) for (let x = 20; x <= 25; x++) if (get(x, y) === W) set(x, y, BR);

  // claro final con seto
  rect(32, 2, 41, 8, G);
  rect(36, 3, 37, 8, P);
  rect(33, 5, 40, 7, P);
  for (let x = 31; x <= 42; x++) if (x < 36 || x > 37) set(x, 9, HE);
  for (let y = 1; y <= 9; y++) {
    set(31, y, HE);
    set(42, y, HE);
  }

  // borde de árboles
  for (let y = 0; y < MAP_H; y++)
    for (let x = 0; x < MAP_W; x++) {
      if (x < 2 || y < 2 || x >= MAP_W - 2 || y >= MAP_H - 2) {
        if (get(x, y) !== W) set(x, y, (x + y) % 2 === 0 ? TR : BU);
      }
    }

  // zonas reservadas (no poner decoración)
  const reserved = new Set();
  const reserve = (x, y, r = 1) => {
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) reserved.add(`${x + i},${y + j}`);
  };
  for (const o of objects) {
    for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) reserve(o.x + i, o.y + j, o.type === 'house' ? 1 : 1);
  }
  for (let y = 2; y <= 8; y++) for (let x = 32; x <= 41; x++) reserved.add(`${x},${y}`);
  for (let y = 18; y <= 25; y++) for (let x = 2; x <= 10; x++) reserved.add(`${x},${y}`);

  const r = rng(20241004);
  const nearPath = (x, y, d) => {
    for (let j = -d; j <= d; j++) for (let i = -d; i <= d; i++) {
      const t = get(x + i, y + j);
      if (t === P || t === BR) return true;
    }
    return false;
  };

  for (let y = 2; y < MAP_H - 2; y++)
    for (let x = 2; x < MAP_W - 2; x++) {
      if (get(x, y) !== G || reserved.has(`${x},${y}`)) continue;
      const v = r();
      if (!nearPath(x, y, 1)) {
        if (v < 0.11 && !nearPath(x, y, 2)) set(x, y, TR);
        else if (v < 0.15) set(x, y, BU);
        else if (v < 0.165) set(x, y, RK);
        else if (v < 0.25) set(x, y, FL);
      } else if (v < 0.08) set(x, y, FL);
    }

  // campos de flores alrededor de las estrellas (escondites)
  for (const o of objects.filter((o) => o.type === 'star')) {
    for (let j = -1; j <= 1; j++)
      for (let i = -2; i <= 2; i++) {
        const t = get(o.x + i, o.y + j);
        if (t === G || t === TR || t === BU || t === RK) set(o.x + i, o.y + j, FL);
      }
  }
  // asegurar que los objetos estén sobre suelo
  for (const o of objects) {
    if (o.type === 'house' || o.type === 'bigtree') continue;
    for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) {
      const t = get(o.x + i, o.y + j);
      if (t !== P && t !== BR) set(o.x + i, o.y + j, o.type === 'star' ? FL : G);
    }
  }
  // camino accesible a cada objeto interactivo: asegurar alrededor libre
  for (const o of objects) {
    if (['sign', 'chest', 'cat', 'pedestal', 'mailbox'].includes(o.type)) {
      for (const [i, j] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) {
        const t = get(o.x + i, o.y + j);
        if (t === TR || t === BU || t === RK) set(o.x + i, o.y + j, G);
      }
    }
  }

  return { tiles: m, get, isSolidTile: (x, y) => SOLID.has(get(x, y)) };
}

// ═════════════════════════════════════════════════════════════
//   ARTE
// ═════════════════════════════════════════════════════════════
export const PAL = {
  grass: '#5fa548',
  grass2: '#64aa4c',
  grassDark: '#4a8a3a',
  grassLight: '#8fd06a',
  path: '#d4a86a',
  path2: '#c4985a',
  pathEdge: '#a07444',
  water: '#3f86c9',
  water2: '#2f6fb0',
  waterLight: '#9fdcf7',
  foam: '#d8f3ff',
  wood: '#8a5a3a',
  wood2: '#6b4228',
  leaf1: '#2f6b3a',
  leaf2: '#3e8a45',
  leaf3: '#5aa652',
  leaf4: '#86c86a',
  outline: '#1f2d24',
  stone: '#9aa3ad',
  stone2: '#6e7782',
  hedge: '#3a7d3f',
  roof: '#d9707b',
  roof2: '#b05565',
  wall: '#f3e6cf',
  wall2: '#d8c6a6',
};

function px(ctx, c, x, y, w = 1, h = 1) {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}
function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return c;
}
function circle(ctx, c, cx, cy, r) {
  ctx.fillStyle = c;
  for (let y = -r; y <= r; y++) {
    const w = Math.floor(Math.sqrt(r * r - y * y));
    ctx.fillRect(cx - w, cy + y, w * 2 + 1, 1);
  }
}

// ── Sprites del escenario ─────────────────────────────────────
export function buildArt() {
  const art = {};

  // árbol 32x36
  {
    const c = makeCanvas(32, 38);
    const x = c.getContext('2d');
    px(x, PAL.outline, 12, 26, 8, 11);
    px(x, PAL.wood, 13, 26, 6, 10);
    px(x, PAL.wood2, 13, 30, 2, 6);
    px(x, '#00000030', 8, 35, 16, 3);
    circle(x, PAL.outline, 16, 15, 15);
    circle(x, PAL.leaf1, 16, 15, 14);
    circle(x, PAL.leaf2, 15, 13, 12);
    circle(x, PAL.leaf3, 13, 11, 8);
    circle(x, PAL.leaf4, 11, 8, 3);
    const r = rng(7);
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = r() * 11;
      px(x, r() > 0.5 ? PAL.leaf1 : PAL.leaf4, Math.round(16 + Math.cos(a) * d), Math.round(15 + Math.sin(a) * d), 2, 1);
    }
    art.tree = c;
  }
  // gran árbol del final 64x72, con flores rosadas
  {
    const c = makeCanvas(72, 80);
    const x = c.getContext('2d');
    px(x, PAL.outline, 28, 48, 16, 30);
    px(x, PAL.wood, 30, 48, 12, 29);
    px(x, PAL.wood2, 30, 56, 3, 21);
    px(x, PAL.wood, 22, 74, 28, 4);
    circle(x, PAL.outline, 36, 30, 30);
    circle(x, '#b0457a', 36, 30, 29);
    circle(x, '#d8689a', 34, 27, 25);
    circle(x, '#f093b8', 30, 22, 16);
    circle(x, '#ffc6dc', 26, 17, 6);
    const r = rng(11);
    for (let i = 0; i < 90; i++) {
      const a = r() * Math.PI * 2, d = r() * 26;
      px(x, ['#ffd6e6', '#b0457a', '#fff2f7'][i % 3], Math.round(36 + Math.cos(a) * d), Math.round(30 + Math.sin(a) * d), 2, 2);
    }
    art.bigtree = c;
  }
  // arbusto 16x16
  {
    const c = makeCanvas(16, 16);
    const x = c.getContext('2d');
    circle(x, PAL.outline, 8, 9, 7);
    circle(x, PAL.leaf2, 8, 9, 6);
    circle(x, PAL.leaf3, 7, 7, 4);
    px(x, PAL.leaf4, 5, 5, 2, 1);
    px(x, '#e86a8a', 10, 8, 2, 2);
    px(x, '#e86a8a', 5, 11, 2, 2);
    art.bush = c;
  }
  // roca
  {
    const c = makeCanvas(16, 16);
    const x = c.getContext('2d');
    circle(x, PAL.outline, 8, 10, 6);
    circle(x, PAL.stone2, 8, 10, 5);
    circle(x, PAL.stone, 7, 9, 4);
    px(x, '#d6dde3', 5, 7, 3, 1);
    art.rock = c;
  }
  // letrero
  {
    const c = makeCanvas(16, 18);
    const x = c.getContext('2d');
    px(x, PAL.outline, 7, 9, 3, 9);
    px(x, PAL.wood2, 8, 9, 1, 8);
    px(x, PAL.outline, 1, 1, 14, 10);
    px(x, PAL.wood, 2, 2, 12, 8);
    px(x, '#b07a50', 2, 2, 12, 2);
    px(x, PAL.wood2, 4, 5, 8, 1);
    px(x, PAL.wood2, 4, 7, 6, 1);
    art.sign = c;
  }
  // cofre cerrado / abierto
  for (const open of [false, true]) {
    const c = makeCanvas(16, 16);
    const x = c.getContext('2d');
    px(x, '#00000030', 2, 14, 12, 2);
    px(x, PAL.outline, 1, 5, 14, 10);
    px(x, '#b8652f', 2, 6, 12, 8);
    px(x, '#8e4720', 2, 10, 12, 4);
    px(x, '#f2c14e', 2, 9, 12, 1);
    px(x, '#f2c14e', 7, 8, 2, 4);
    px(x, PAL.outline, 7, 10, 2, 1);
    if (open) {
      px(x, PAL.outline, 1, 0, 14, 6);
      px(x, '#3a1d10', 2, 4, 12, 2);
      px(x, '#d47a3d', 2, 1, 12, 3);
      px(x, '#fff3a8', 4, 5, 8, 1);
    } else {
      px(x, PAL.outline, 1, 2, 14, 4);
      px(x, '#d47a3d', 2, 3, 12, 3);
      px(x, '#e8955a', 2, 3, 12, 1);
    }
    art[open ? 'chestOpen' : 'chest'] = c;
  }
  // buzón
  {
    const c = makeCanvas(16, 20);
    const x = c.getContext('2d');
    px(x, PAL.outline, 7, 9, 3, 11);
    px(x, PAL.wood, 8, 9, 1, 10);
    px(x, PAL.outline, 2, 2, 12, 8);
    px(x, '#5f7fd1', 3, 3, 10, 6);
    px(x, '#7d9be6', 3, 3, 10, 2);
    px(x, '#e04a5a', 12, 0, 2, 5);
    px(x, PAL.outline, 4, 6, 6, 1);
    art.mailbox = c;
  }
  // pedestal
  {
    const c = makeCanvas(16, 20);
    const x = c.getContext('2d');
    px(x, '#00000030', 1, 17, 14, 3);
    px(x, PAL.outline, 2, 6, 12, 13);
    px(x, PAL.stone, 3, 7, 10, 11);
    px(x, PAL.stone2, 3, 14, 10, 4);
    px(x, PAL.outline, 0, 3, 16, 4);
    px(x, '#c3cad1', 1, 4, 14, 2);
    px(x, '#8be0ff', 6, 9, 4, 4);
    px(x, '#d6f6ff', 6, 9, 2, 2);
    art.pedestal = c;
  }
  // farol
  {
    const c = makeCanvas(16, 32);
    const x = c.getContext('2d');
    px(x, '#00000030', 4, 29, 8, 3);
    px(x, PAL.outline, 7, 8, 3, 23);
    px(x, '#3a3550', 8, 8, 1, 22);
    px(x, PAL.outline, 3, 0, 10, 10);
    px(x, '#3a3550', 4, 1, 8, 1);
    px(x, '#ffe6a3', 5, 3, 6, 5);
    px(x, '#fff8dc', 6, 4, 3, 2);
    px(x, PAL.outline, 5, 30, 7, 2);
    art.lamp = c;
  }
  // flores (cerca) cerrada
  {
    const c = makeCanvas(32, 24);
    const x = c.getContext('2d');
    px(x, PAL.outline, 0, 4, 32, 18);
    px(x, '#3e8a45', 1, 5, 30, 16);
    px(x, '#5aa652', 1, 5, 30, 4);
    const r = rng(3);
    for (let i = 0; i < 22; i++) px(x, ['#ffd1e1', '#f7a8c4', '#fff6c2'][i % 3], 2 + Math.floor(r() * 27), 6 + Math.floor(r() * 13), 2, 2);
    art.gate = c;
  }
  // casa 96x88
  {
    const c = makeCanvas(96, 88);
    const x = c.getContext('2d');
    px(x, '#00000030', 6, 82, 86, 6);
    // paredes
    px(x, PAL.outline, 8, 38, 80, 46);
    px(x, PAL.wall, 9, 39, 78, 44);
    px(x, PAL.wall2, 9, 76, 78, 7);
    for (let i = 0; i < 6; i++) px(x, PAL.wall2, 9, 46 + i * 6, 78, 1);
    // techo
    for (let i = 0; i < 34; i++) {
      const inset = Math.max(0, 22 - i);
      px(x, PAL.outline, 2 + inset, 4 + i, 92 - inset * 2, 1);
      px(x, i % 6 < 3 ? PAL.roof : PAL.roof2, 3 + inset, 4 + i, 90 - inset * 2, 1);
    }
    px(x, PAL.outline, 0, 38, 96, 3);
    px(x, '#c25d6a', 2, 38, 92, 2);
    // chimenea
    px(x, PAL.outline, 66, 0, 12, 18);
    px(x, '#b0857a', 67, 1, 10, 17);
    // puerta
    px(x, PAL.outline, 40, 56, 18, 28);
    px(x, '#7a4a30', 41, 57, 16, 27);
    px(x, '#98603e', 43, 59, 12, 10);
    px(x, '#f2c14e', 53, 70, 2, 2);
    // ventanas
    for (const wx of [16, 66]) {
      px(x, PAL.outline, wx, 50, 16, 16);
      px(x, '#ffe6a3', wx + 1, 51, 14, 14);
      px(x, '#fff6d6', wx + 2, 52, 5, 5);
      px(x, PAL.outline, wx + 7, 51, 2, 14);
      px(x, PAL.outline, wx + 1, 57, 14, 2);
      px(x, '#7bb85a', wx - 1, 66, 18, 4);
      px(x, '#f7a8c4', wx + 1, 65, 2, 2);
      px(x, '#f7a8c4', wx + 7, 65, 2, 2);
      px(x, '#f7a8c4', wx + 13, 65, 2, 2);
    }
    art.house = c;
  }
  return art;
}

// ── Dibuja el suelo completo (capa estática) ────────────────────
export function renderGround(map) {
  const c = makeCanvas(MAP_W * TILE, MAP_H * TILE);
  const x = c.getContext('2d');
  const r = rng(99);
  const t = (i, j) => map.get(i, j);
  const isPath = (i, j) => t(i, j) === P || t(i, j) === BR;
  const isWater = (i, j) => t(i, j) === W || t(i, j) === BR;

  for (let j = 0; j < MAP_H; j++)
    for (let i = 0; i < MAP_W; i++) {
      const X = i * TILE, Y = j * TILE;
      // pasto base con textura
      px(x, (i * 7 + j * 13) % 5 === 0 ? PAL.grass2 : PAL.grass, X, Y, TILE, TILE);
      for (let k = 0; k < 5; k++) {
        const gx = X + Math.floor(r() * 15), gy = Y + Math.floor(r() * 14);
        px(x, PAL.grassDark, gx, gy, 1, 2);
        px(x, PAL.grassDark, gx + 1, gy + 1, 1, 1);
      }
      if (r() < 0.3) px(x, PAL.grassLight, X + Math.floor(r() * 14), Y + Math.floor(r() * 14), 2, 1);
    }

  for (let j = 0; j < MAP_H; j++)
    for (let i = 0; i < MAP_W; i++) {
      const X = i * TILE, Y = j * TILE;
      const tt = t(i, j);
      if (tt === P) {
        px(x, PAL.path, X, Y, TILE, TILE);
        for (let k = 0; k < 4; k++) px(x, PAL.path2, X + Math.floor(r() * 14), Y + Math.floor(r() * 14), 2, 1);
        if (r() < 0.25) px(x, '#e8c690', X + Math.floor(r() * 13), Y + Math.floor(r() * 13), 2, 2);
        // bordes suaves
        if (!isPath(i, j - 1)) { px(x, PAL.pathEdge, X, Y, TILE, 2); px(x, PAL.grassDark, X, Y, TILE, 1); }
        if (!isPath(i, j + 1)) { px(x, PAL.pathEdge, X, Y + 14, TILE, 2); }
        if (!isPath(i - 1, j)) { px(x, PAL.pathEdge, X, Y, 2, TILE); }
        if (!isPath(i + 1, j)) { px(x, PAL.pathEdge, X + 14, Y, 2, TILE); }
        if (!isPath(i - 1, j) && !isPath(i, j - 1)) px(x, PAL.grass, X, Y, 2, 2);
        if (!isPath(i + 1, j) && !isPath(i, j - 1)) px(x, PAL.grass, X + 14, Y, 2, 2);
        if (!isPath(i - 1, j) && !isPath(i, j + 1)) px(x, PAL.grass, X, Y + 14, 2, 2);
        if (!isPath(i + 1, j) && !isPath(i, j + 1)) px(x, PAL.grass, X + 14, Y + 14, 2, 2);
      } else if (tt === W || tt === BR) {
        px(x, PAL.water, X, Y, TILE, TILE);
        px(x, PAL.water2, X, Y + 10, TILE, 6);
        if (!isWater(i, j - 1)) { px(x, '#2a5a3a', X, Y, TILE, 3); px(x, PAL.foam, X, Y + 3, TILE, 1); }
        if (!isWater(i, j + 1)) px(x, PAL.foam, X, Y + 15, TILE, 1);
        if (!isWater(i - 1, j)) px(x, PAL.foam, X, Y, 1, TILE);
        if (!isWater(i + 1, j)) px(x, PAL.foam, X + 15, Y, 1, TILE);
        if (tt === BR) {
          px(x, PAL.outline, X, Y, TILE, TILE);
          for (let k = 0; k < 4; k++) {
            px(x, k % 2 ? PAL.wood : '#a06a44', X + k * 4, Y + 1, 3, 14);
            px(x, '#c08a5a', X + k * 4, Y + 1, 3, 1);
          }
          if (!isPath(i, j - 1) || t(i, j - 1) === W) { px(x, PAL.outline, X, Y, TILE, 2); px(x, PAL.wood2, X, Y + 1, TILE, 1); }
          if (!isPath(i, j + 1) || t(i, j + 1) === W) { px(x, PAL.outline, X, Y + 14, TILE, 2); px(x, PAL.wood2, X, Y + 14, TILE, 1); }
        }
      } else if (tt === FL) {
        const cols = ['#ffd1e1', '#f7a8c4', '#fff6c2', '#c9b6ff', '#ffffff'];
        for (let k = 0; k < 4; k++) {
          const fx = X + 2 + Math.floor(r() * 11), fy = Y + 2 + Math.floor(r() * 11);
          const col = cols[Math.floor(r() * cols.length)];
          px(x, PAL.grassDark, fx + 1, fy + 2, 1, 2);
          px(x, col, fx, fy + 1, 3, 1);
          px(x, col, fx + 1, fy, 1, 3);
          px(x, '#f2c14e', fx + 1, fy + 1, 1, 1);
        }
      } else if (tt === HE) {
        px(x, PAL.outline, X, Y + 1, TILE, 15);
        px(x, PAL.hedge, X, Y + 2, TILE, 13);
        px(x, PAL.leaf3, X, Y + 2, TILE, 4);
        px(x, '#ffd1e1', X + 3 + ((i * 5) % 9), Y + 6, 2, 2);
        px(x, PAL.leaf4, X + ((i * 3) % 12), Y + 3, 3, 1);
      }
    }
  return c;
}

// Elementos que se ordenan por profundidad (árboles, arbustos, rocas)
export function propsFromMap(map) {
  const out = [];
  for (let j = 0; j < MAP_H; j++)
    for (let i = 0; i < MAP_W; i++) {
      const t = map.get(i, j);
      if (t === TR) out.push({ kind: 'tree', x: i, y: j });
      else if (t === BU) out.push({ kind: 'bush', x: i, y: j });
      else if (t === RK) out.push({ kind: 'rock', x: i, y: j });
    }
  return out;
}
