// ─────────────────────────────────────────────────────────────
//  Audio: efectos y música 8-bit generados con Web Audio.
//  No necesita archivos. Si config.musica tiene un mp3, se usa ese.
//  Nunca suena nada antes de que ella toque un botón.
// ─────────────────────────────────────────────────────────────
import { config } from '../../config.js';

let ctx = null;
let master = null;
let musicGain = null;
let enabled = true;
let musicTimer = null;
let mode = 'world'; // 'world' | 'ending'
let fileAudio = null;
let fileFailed = false;

const NOTE = (n) => 440 * Math.pow(2, (n - 69) / 12);

export function initAudio() {
  if (ctx) {
    if (ctx.state === 'suspended') ctx.resume();
    return;
  }
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = enabled ? 0.5 : 0;
    master.connect(ctx.destination);
    musicGain = ctx.createGain();
    musicGain.gain.value = 0.22;
    musicGain.connect(master);
  } catch {
    ctx = null;
  }
}

export function setSound(on) {
  enabled = on;
  if (master && ctx) master.gain.setTargetAtTime(on ? 0.5 : 0, ctx.currentTime, 0.05);
  if (fileAudio) {
    if (on) fileAudio.play().catch(() => {});
    else fileAudio.pause();
  }
}

function tone(freq, start, dur, { type = 'square', vol = 0.15, dest = master, slide = 0 } = {}) {
  if (!ctx || !dest) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);
  if (slide) o.frequency.exponentialRampToValueAtTime(freq * slide, start + dur);
  g.gain.setValueAtTime(0, start);
  g.gain.linearRampToValueAtTime(vol, start + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g).connect(dest);
  o.start(start);
  o.stop(start + dur + 0.02);
}

function seq(notes, step = 0.09, opts = {}) {
  if (!ctx || !enabled) return;
  const t = ctx.currentTime + 0.01;
  notes.forEach((n, i) => n != null && tone(NOTE(n), t + i * step, step * 1.6, opts));
}

export const sfx = {
  blip: () => {
    if (!ctx || !enabled) return;
    tone(NOTE(84 + Math.floor(Math.random() * 3)), ctx.currentTime, 0.035, { vol: 0.04 });
  },
  select: () => seq([76, 83], 0.05, { vol: 0.08 }),
  step: () => {},
  open: () => seq([67, 71, 74, 79], 0.07, { vol: 0.1 }),
  item: () => seq([72, 76, 79, 84, null, 84, 88], 0.1, { vol: 0.12, type: 'square' }),
  star: () => seq([88, 91, 96, 100], 0.06, { vol: 0.07, type: 'triangle' }),
  wrong: () => seq([64, 61], 0.12, { vol: 0.07, type: 'triangle' }),
  right: () => seq([72, 76, 79, 84], 0.08, { vol: 0.1 }),
  light: () => seq([79, 83, 86, 91, 95, 98], 0.08, { vol: 0.09, type: 'triangle' }),
  gate: () => seq([60, 64, 67, 72, 76, 79, 84], 0.11, { vol: 0.09, type: 'triangle' }),
  swap: () => seq([79, 74], 0.04, { vol: 0.06 }),
};

// ── Música de fondo ──
const PROG_WORLD = [
  [57, 60, 64, 69], // Am
  [53, 57, 60, 65], // F
  [48, 52, 55, 60], // C
  [55, 59, 62, 67], // G
];
const PROG_END = [
  [53, 57, 60, 64], // Fmaj7
  [55, 59, 62, 65], // G7
  [52, 55, 59, 64], // Em
  [57, 60, 64, 69], // Am
];
const MELODY_END = [76, null, 74, 72, 74, null, 76, 79, 76, null, 74, 72, 71, null, 72, 74];

export function startMusic(newMode = mode) {
  mode = newMode;
  if (!ctx) return;
  if (config.musica && !fileFailed) {
    if (!fileAudio) {
      fileAudio = new Audio(import.meta.env.BASE_URL + config.musica);
      fileAudio.loop = true;
      fileAudio.volume = 0.5;
      fileAudio.addEventListener('error', () => {
        fileFailed = true;
        fileAudio = null;
        startMusic(mode);
      });
    }
    if (enabled) fileAudio.play().catch(() => {});
    return;
  }
  if (musicTimer) clearInterval(musicTimer);
  let bar = 0;
  let next = ctx.currentTime + 0.1;
  const beat = mode === 'ending' ? 0.32 : 0.27;
  const schedule = () => {
    while (next < ctx.currentTime + 1.2) {
      const prog = mode === 'ending' ? PROG_END : PROG_WORLD;
      const chord = prog[bar % prog.length];
      for (let i = 0; i < 8; i++) {
        const n = chord[[0, 1, 2, 3, 2, 1, 2, 3][i]] + 12;
        tone(NOTE(n), next + i * beat, beat * 1.4, { type: 'triangle', vol: 0.05, dest: musicGain });
      }
      tone(NOTE(chord[0] - 12), next, beat * 7.5, { type: 'triangle', vol: 0.07, dest: musicGain });
      if (mode === 'ending') {
        for (let i = 0; i < 4; i++) {
          const m = MELODY_END[(bar * 4 + i) % MELODY_END.length];
          if (m) tone(NOTE(m), next + i * beat * 2, beat * 2.4, { type: 'sine', vol: 0.09, dest: musicGain });
        }
      }
      next += beat * 8;
      bar++;
    }
  };
  schedule();
  musicTimer = setInterval(schedule, 400);
}

export function setMusicMode(m) {
  if (m === mode) return;
  mode = m;
  if (ctx && !fileAudio) startMusic(m);
}
