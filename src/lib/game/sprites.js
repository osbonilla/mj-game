// ─────────────────────────────────────────────────────────────
//  Sprites en pixel art, dibujados a mano como texto.
//  Cada letra es un color de la paleta del personaje.
//  Los colores se pueden cambiar en src/config.js → personajes
// ─────────────────────────────────────────────────────────────

// Letras comunes:
//  K contorno · S piel · s piel sombra · R rubor
//  H pelo · h brillo del pelo · C ropa · c ropa sombra
//  P pantalón · p pantalón sombra · B zapatos · W blanco

const GIRL = {
  down: [
    '................',
    '.....KKKKKK.....',
    '....KHHHHHHK....',
    '...KHHHhhhHHK...',
    '..KHHHHHHHHHHK..',
    '..KHHHHHHHHHHK..',
    '..KHHSSSSSSHHK..',
    '..KHSKSSSSKSHK..',
    '..KHSKSSSSKSHK..',
    '..KHSRSSSSRSHK..',
    '..KHHSSssSSHHK..',
    '..KHHKSSSSKHHK..',
    '..KHKCCCCCCKHK..',
    '..KHSKCCCCKSHK..',
    '...KSKCccCKSK...',
    '....KKCCCCKK....',
    '....KPPPPPPK....',
    '....KPPKKPPK....',
    '....KPPKKPPK....',
    '....KBBKKBBK....',
    '....KKKKKKKK....',
  ],
  up: [
    '................',
    '.....KKKKKK.....',
    '....KHHHHHHK....',
    '...KHHhhhHHHK...',
    '..KHHHHHHHHHHK..',
    '..KHHHhHHHHHHK..',
    '..KHHHHHHHhHHK..',
    '..KHHHHHHHHHHK..',
    '..KHHHHHHHHHHK..',
    '..KHHHHHHHHHHK..',
    '..KHHHHHHHHHHK..',
    '..KHHHHHHHHHHK..',
    '..KSKHHHHHHKSK..',
    '..KSKHHHHHHKSK..',
    '...KKCHHHHCKK...',
    '....KCCCCCCK....',
    '....KPPPPPPK....',
    '....KPPKKPPK....',
    '....KPPKKPPK....',
    '....KBBKKBBK....',
    '....KKKKKKKK....',
  ],
  side: [
    '................',
    '.....KKKKK......',
    '....KHHHHHK.....',
    '...KHHhhHHHK....',
    '..KHHHHHHHHHK...',
    '..KHHHHHHHHHHK..',
    '..KHHHHHSSSSSK..',
    '..KHHHHSSSKSSK..',
    '..KHHHHSSSKSSK..',
    '..KHHHHSSSSRSK..',
    '..KHHHHSSSSSK...',
    '..KHHHHKSSKK....',
    '..KHHHKCCCK.....',
    '...KHKCCcCK.....',
    '...KKCCCcCK.....',
    '....KCCCSCK.....',
    '....KPPPPPK.....',
    '....KPPKPPK.....',
    '....KPPKPPK.....',
    '....KBBKBBBK....',
    '....KKKKKKKK....',
  ],
};

const BOY = {
  down: [
    '...K.KK.KK.K....',
    '..KhKhhKhhKhK...',
    '.KHhHHhHHhHHhK..',
    '.KHHHhHHHHhHHK..',
    'KHhHHHHHHHHHhHK.',
    'KHHHSSSSSSSSHHK.',
    '.KHSSSSSSSSSSHK.',
    '.KSSKSSSSSSKSSK.',
    '.KSSKSSSSSSKSSK.',
    '.KSSSSSSSSSSSSK.',
    '..KSSSSssSSSSK..',
    '...KKSSSSSSKK...',
    '..KCCKKSSKKCCK..',
    '.KCCCCCCCCCCCCK.',
    '.KCCKCCCCCCKCCK.',
    '.KCCKCCCCCCKCCK.',
    '.KSSKCCCCCCKSSK.',
    '..KKKcCCCCcKKK..',
    '....KPPPPPPK....',
    '....KPPPPPPK....',
    '....KPPKKPPK....',
    '....KPPKKPPK....',
    '....KPPKKPPK....',
    '...KBBBKKBBBK...',
    '...KKKKKKKKKK...',
  ],
  up: [
    '...K.KK.KK.K....',
    '..KhKhhKhhKhK...',
    '.KHhHHhHHhHHhK..',
    '.KHHHhHHHHhHHK..',
    'KHhHHHHHHHHHhHK.',
    'KHHHhHHHHhHHHHK.',
    '.KHHHHhHHHHhHHK.',
    '.KHhHHHHHHHHHHK.',
    '.KHHHHHhHHhHHHK.',
    '.KHHhHHHHHHHHHK.',
    '..KHHHHHHHHHHK..',
    '...KKSSSSSSKK...',
    '..KCCKKKKKKCCK..',
    '.KCCCCCCCCCCCCK.',
    '.KCCKCCCCCCKCCK.',
    '.KCCKCCCCCCKCCK.',
    '.KSSKCCCCCCKSSK.',
    '..KKKcCCCCcKKK..',
    '....KPPPPPPK....',
    '....KPPPPPPK....',
    '....KPPKKPPK....',
    '....KPPKKPPK....',
    '....KPPKKPPK....',
    '...KBBBKKBBBK...',
    '...KKKKKKKKKK...',
  ],
  side: [
    '....K.KK.KK.....',
    '...KhKhhKhhK....',
    '..KHhHHhHHhHK...',
    '.KHHHhHHHHhHHK..',
    '.KhHHHHHHHHHhHK.',
    '.KHHHHHHSSSSSHK.',
    '.KHHHHHSSSSSSSK.',
    '..KHHHSSSSKSSSK.',
    '..KHHHSSSSKSSSK.',
    '..KHHSSSSSSSSSK.',
    '...KHSSSSSSSsK..',
    '....KKSSSSSKK...',
    '.....KCCSSK.....',
    '....KCCCCCCK....',
    '....KCCCcCCK....',
    '....KCCCcCCK....',
    '....KCCCcCCK....',
    '....KcCCSScK....',
    '....KPPPPPPK....',
    '....KPPPPPPK....',
    '....KPPKPPPK....',
    '....KPPKPPPK....',
    '....KPPKPPPK....',
    '....KBBKBBBBK...',
    '....KKKKKKKKK...',
  ],
};

// Fotogramas de caminar: se reemplazan las últimas 4 filas (piernas)
function walkFrames(base, kind) {
  const n = base.length;
  const legsA = kind === 'side'
    ? ['....KPPKPPPK....', '...KPPK.KPPK....', '..KBBK...KBBBK..', '..KKKK...KKKKK..']
    : ['....KPPKKPPK....', '....KBBKKPPK....', '....KKKKKPPK....', '.........KBBK...'];
  const legsB = kind === 'side'
    ? ['....KPPKPPPK....', '.....KPPPPK.....', '.....KBBBBBK....', '.....KKKKKKK....']
    : ['....KPPKKPPK....', '....KPPKKBBK....', '....KPPKKKKK....', '...KBBK.........'];
  const pad = (rows, w) => rows.map((r) => r.padEnd(w, '.').slice(0, w));
  const w = base[0].length;
  const a = [...base.slice(0, n - 4), ...pad(legsA, w)];
  const b = [...base.slice(0, n - 4), ...pad(legsB, w)];
  return [base, a, base, b];
}

export const SPRITE_DEFS = { girl: GIRL, boy: BOY };

// Convierte las filas de texto en un canvas
function rowsToCanvas(rows, palette, flip = false) {
  const h = rows.length;
  const w = rows[0].length;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const ch = rows[y][flip ? w - 1 - x : x];
      const col = palette[ch];
      if (!col) continue;
      ctx.fillStyle = col;
      ctx.fillRect(x, y, 1, 1);
    }
  }
  return c;
}

function shade(hex, amt) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (v) => Math.max(0, Math.min(255, Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt)));
  return '#' + [f(r), f(g), f(b)].map((v) => v.toString(16).padStart(2, '0')).join('');
}

export function makePalette(colors) {
  return {
    K: colors.outline ?? '#2a1b2d',
    S: colors.skin,
    s: shade(colors.skin, -0.16),
    R: colors.blush ?? '#e8857f',
    H: colors.hair,
    h: shade(colors.hair, 0.28),
    C: colors.shirt,
    c: shade(colors.shirt, -0.22),
    P: colors.pants,
    p: shade(colors.pants, -0.22),
    B: colors.shoes,
    W: '#ffffff',
  };
}

// Devuelve { down:[4 frames], up:[...], left:[...], right:[...] }
export function buildCharacter(kind, colors) {
  const def = SPRITE_DEFS[kind];
  const pal = makePalette(colors);
  const out = {};
  for (const dir of ['down', 'up']) {
    out[dir] = walkFrames(def[dir], dir).map((f) => rowsToCanvas(f, pal));
  }
  const side = walkFrames(def.side, 'side');
  out.right = side.map((f) => rowsToCanvas(f, pal));
  out.left = side.map((f) => rowsToCanvas(f, pal, true));
  out.w = def.down[0].length;
  out.h = def.down.length;
  return out;
}

// Pequeños sprites de objetos ------------------------------------
const OBJ = {
  cat: [
    '................',
    '..K.........K...',
    '.KOK.......KOK..',
    '.KOOKKKKKKKOOK..',
    '.KOOOOOOOOOOOK..',
    'KOOKWOOOOOKWOOK.',
    'KOOKKOOOOOKKOOK.',
    'KOOOOOPPOOOOOOK.',
    '.KOOOOKKKOOOOK..',
    '..KKOOOOOOOKK...',
    '...KOOOOOOOOK.KK',
    '..KOOWWWWWOOOKOK',
    '..KOOWWWWWOOOOK.',
    '..KOOOOOOOOOOK..',
    '...KOKKOKKOOK...',
    '....K..K..KK....',
  ],
};

export function buildObjectSprite(name) {
  const pal = { K: '#2a1b2d', O: '#9da3ad', W: '#eef0f4', P: '#f2a3b3' }; // Hugo: gatito gris
  return rowsToCanvas(OBJ[name], pal);
}
