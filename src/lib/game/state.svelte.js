// ─────────────────────────────────────────────────────────────
//  Estado global + máquina de estados + guardado en localStorage
// ─────────────────────────────────────────────────────────────
import { config } from '../../config.js';

const KEY = 'nuestro-pequeno-universo:v1';

function fresh() {
  return {
    started: false,
    introSeen: false,
    tutorialSeen: false,
    pos: null, // {x, y, dir}
    found: {}, // id → true (letreros, cofres, estrellas)
    journal: [], // ids en orden de descubrimiento
    quiz: false,
    puzzle: false,
    gateOpen: false,
    ending: false,
    sound: true,
  };
}

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { ...fresh(), ...JSON.parse(raw) };
  } catch {}
  return fresh();
}

export const progress = $state(load());

// scene: 'menu' | 'intro' | 'world' | 'ending'
// overlay: null | 'dialogue' | 'item' | 'quiz' | 'puzzle' | 'journal' | 'pause' | 'message' | 'letter'
export const ui = $state({
  scene: 'menu',
  overlay: null,
  dialogue: null, // { speaker, lines, onDone }
  item: null, // datos del cofre abierto
  toast: null, // { text, key }
  journalFocus: null,
  celebrate: 0, // contador para disparar confeti
});

export function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify($state.snapshot(progress)));
  } catch {}
}

export function resetProgress() {
  const keepSound = progress.sound;
  Object.assign(progress, fresh(), { sound: keepSound });
  save();
}

// ── Luces (las 3 condiciones para el final) ──
export function starsFound() {
  return [0, 1, 2].filter((i) => progress.found[`estrella-${i}`]).length;
}
export function lights() {
  return [starsFound() === 3, progress.quiz, progress.puzzle];
}
export function lightsCount() {
  return lights().filter(Boolean).length;
}

export function discover(id) {
  if (progress.found[id]) return false;
  progress.found[id] = true;
  progress.journal.push(id);
  save();
  return true;
}

// ── Catálogo de todo lo coleccionable para el diario ──
export function catalog() {
  const items = [];
  config.letreros.forEach((l) => items.push({ id: l.id, kind: 'nota', title: l.titulo, text: l.texto }));
  config.cofres.forEach((c) =>
    items.push({ id: c.id, kind: 'foto', title: c.titulo, text: c.texto, date: c.fecha, photo: c.foto, object: c.objeto })
  );
  config.estrellas.frases.forEach((f, i) => items.push({ id: `estrella-${i}`, kind: 'estrella', title: `Estrella ${i + 1}`, text: f }));
  items.push({ id: 'pregunta', kind: 'insignia', title: `La pregunta de ${config.pregunta.npc}`, text: config.pregunta.premio });
  items.push({ id: 'rompecabezas', kind: 'dibujo', title: 'Nuestro árbol', text: config.rompecabezas.premio });
  items.push({ id: 'carta', kind: 'carta', title: config.carta.titulo, text: config.carta.texto });
  return items;
}

// ── Diálogos ──
export function say(lines, speaker = '', onDone = null) {
  ui.dialogue = { lines: Array.isArray(lines) ? lines : [lines], speaker, onDone };
  ui.overlay = 'dialogue';
}

export function closeOverlay() {
  ui.overlay = null;
  ui.dialogue = null;
  ui.item = null;
}

let toastN = 0;
export function toast(text) {
  ui.toast = { text, key: ++toastN };
  const k = toastN;
  setTimeout(() => {
    if (ui.toast?.key === k) ui.toast = null;
  }, 4200);
}
