// Ilustraciones pixel art generadas en código:
//  - la escena de los dos bajo el árbol (rompecabezas, fotos que faltan, menú)
import { buildCharacter } from './sprites.js';
import { config } from '../../config.js';

function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (Math.imul(s ^ (s >>> 15), 1 | s) + 0x6d2b79f5) >>> 0) / 4294967296);
}

let chars = null;
function characters() {
  chars ??= { girl: buildCharacter('girl', config.personajes.ella), boy: buildCharacter('boy', config.personajes.yo) };
  return chars;
}

const SKY = ['#1b1638', '#241c4e', '#2f2363', '#3e2b74', '#59358a', '#7a4596'];

export function drawCoupleScene(w = 96, h = 96, { seed = 5, island = false, tint = null } = {}) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const x = c.getContext('2d');
  const r = rng(seed);
  const px = (col, a, b, ww = 1, hh = 1) => { x.fillStyle = col; x.fillRect(a, b, ww, hh); };

  if (!island) {
    // cielo en franjas con tramado
    const band = Math.ceil((h * 0.75) / SKY.length);
    SKY.forEach((col, i) => {
      px(col, 0, i * band, w, band);
      if (i > 0) for (let k = 0; k < w; k += 2) px(SKY[i - 1], k + (i % 2), i * band, 1, 1);
    });
    for (let i = 0; i < (w * h) / 90; i++) px(r() > 0.85 ? '#ffe9a8' : '#fff8ef', Math.floor(r() * w), Math.floor(r() * h * 0.6), 1, 1);
    // luna
    const mx = Math.round(w * 0.18), my = Math.round(h * 0.17), mr = Math.max(4, Math.round(w / 16));
    for (let j = -mr; j <= mr; j++) {
      const ww = Math.floor(Math.sqrt(mr * mr - j * j));
      px('#fff3d6', mx - ww, my + j, ww * 2 + 1, 1);
    }
    for (let j = -mr; j <= mr; j++) {
      const ww = Math.floor(Math.sqrt(mr * mr - j * j));
      px(SKY[1], mx - ww + Math.round(mr * 0.7), my + j - 1, ww * 2 + 1, 1);
    }
  }

  // colina
  const groundY = Math.round(h * 0.74);
  if (island) {
    // isla flotante: roca que se estrecha hacia abajo
    const depth = h - groundY - 2;
    for (let j = 0; j < depth; j++) {
      const k = j / depth;
      const inset = Math.round(4 + Math.pow(k, 0.8) * (w / 2 - 8) + Math.sin(j * 1.7) * 1.5);
      px('#2a1b2d', inset - 1, groundY + 2 + j, w - inset * 2 + 2, 1);
      px(j % 4 < 2 ? '#5a4580' : '#4a3a6a', inset, groundY + 2 + j, w - inset * 2, 1);
      if (j % 5 === 2) px('#7a63a6', inset + 2, groundY + 2 + j, Math.max(1, (w - inset * 2) / 3), 1);
    }
    for (let i = 3; i < w - 3; i++) {
      const hy = groundY - Math.round(Math.sin((i / w) * Math.PI) * h * 0.05);
      px('#2a1b2d', i, hy - 1, 1, 1);
      px('#2c5a33', i, hy, 1, groundY + 4 - hy);
      px('#3e7a45', i, hy, 1, 2);
    }
  } else {
    for (let i = 0; i < w; i++) {
      const hy = groundY - Math.round(Math.sin((i / w) * Math.PI) * h * 0.06);
      px('#2c5a33', i, hy, 1, h - hy);
      px('#3e7a45', i, hy, 1, 2);
    }
  }
  // flores
  for (let i = 0; i < w / 4; i++) px(['#ffd1e1', '#f7a8c4', '#fff6c2'][i % 3], island ? 8 + Math.floor(r() * (w - 16)) : Math.floor(r() * w), groundY + 2 + Math.floor(r() * (h - groundY - 4) * (island ? 0.2 : 1)), 1, 1);

  // árbol rosado
  const tx = Math.round(w * 0.66), ty = groundY;
  px('#2a1b2d', tx - 3, ty - 26, 7, 27);
  px('#8a5a3a', tx - 2, ty - 26, 5, 26);
  const blob = (cx, cy, rr, col) => {
    for (let j = -rr; j <= rr; j++) {
      const ww = Math.floor(Math.sqrt(rr * rr - j * j));
      px(col, cx - ww, cy + j, ww * 2 + 1, 1);
    }
  };
  blob(tx, ty - 36, 17, '#2a1b2d');
  blob(tx, ty - 36, 16, '#b0457a');
  blob(tx - 2, ty - 38, 13, '#d8689a');
  blob(tx - 5, ty - 42, 7, '#f093b8');
  for (let i = 0; i < 40; i++) {
    const a = r() * Math.PI * 2, d = r() * 15;
    px(i % 2 ? '#ffd6e6' : '#b0457a', Math.round(tx + Math.cos(a) * d), Math.round(ty - 36 + Math.sin(a) * d), 1, 1);
  }

  // los dos, mirándose
  const { girl, boy } = characters();
  const gx = Math.round(w * 0.38) - 8;
  x.drawImage(girl.right[0], gx, groundY - girl.h + 2);
  x.drawImage(boy.left[0], gx + 13, groundY - boy.h + 2);
  // luciérnagas
  for (let i = 0; i < 10; i++) px('#fff6b0', Math.floor(r() * w), Math.floor(groundY - 4 - r() * h * 0.35), 1, 1);

  if (tint) {
    x.globalCompositeOperation = 'source-atop';
    x.fillStyle = tint;
    x.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'source-over';
  }
  return c;
}

export function sceneDataURL(w, h, opts) {
  return drawCoupleScene(w, h, opts).toDataURL();
}
