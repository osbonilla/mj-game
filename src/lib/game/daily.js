// Mensaje nuevo cada vez que ella abre la app.
// Recargar la misma pestaña no gasta mensajes; abrir la app de nuevo, sí.
import { mensajes } from '../data/mensajes.js';

const KEY = 'nuestro-pequeno-universo:mensaje';
const SESSION = 'nuestro-pequeno-universo:mensaje-actual';

function read(store, key) {
  try { return store.getItem(key); } catch { return null; }
}
function write(store, key, v) {
  try { store.setItem(key, String(v)); } catch {}
}

export function messageForThisOpen() {
  const total = mensajes.length;
  let opened = Number(read(sessionStorage, SESSION));
  const hasSession = read(sessionStorage, SESSION) != null;
  if (!hasSession) {
    const next = Number(read(localStorage, KEY) ?? 0) || 0;
    opened = next;
    write(localStorage, KEY, next + 1);
    write(sessionStorage, SESSION, next);
  }
  const index = opened % total;
  return { index, number: index + 1, total, text: mensajes[index], round: Math.floor(opened / total) };
}

// Mensajes ya leídos (del más reciente al más antiguo)
export function readMessages() {
  const total = mensajes.length;
  const count = Math.min(total, Number(read(localStorage, KEY) ?? 0) || 0);
  const out = [];
  for (let i = count - 1; i >= 0; i--) out.push({ number: i + 1, text: mensajes[i] });
  return out;
}

export function resetMessages() {
  try {
    localStorage.removeItem(KEY);
    sessionStorage.removeItem(SESSION);
  } catch {}
}
