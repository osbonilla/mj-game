<script>
  import { onMount } from 'svelte';
  import { config } from '../../config.js';
  import { Engine } from '../game/engine.js';
  import { progress, ui, save, say, closeOverlay, discover, toast, lights, lightsCount, starsFound, catalog } from '../game/state.svelte.js';
  import { sfx, startMusic, setMusicMode, setSound, initAudio } from '../game/audio.js';
  import Dialogue from './Dialogue.svelte';
  import NoteCard from './NoteCard.svelte';
  import ItemGet from './ItemGet.svelte';
  import Quiz from './Quiz.svelte';
  import Puzzle from './Puzzle.svelte';
  import Journal from './Journal.svelte';
  import PauseMenu from './PauseMenu.svelte';
  import MessageCard from './MessageCard.svelte';
  import FinalLetter from './FinalLetter.svelte';
  import TouchControls from './TouchControls.svelte';

  let { daily, onMenu, onReset } = $props();

  let canvas;
  let engine = $state.raw(null);
  let near = $state(null);
  let note = $state(null);
  let item = $state(null);
  let itemRevisit = $state(false);
  let cinema = $state(false);
  let journalTab = $state('recuerdos');
  let confetti = $state([]);
  const touch = typeof matchMedia !== 'undefined' && matchMedia('(pointer: coarse)').matches;
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const total = catalog().length;

  let lit = $derived(lights());
  let unlocked = $derived(progress.journal.length);
  let objective = $derived(
    progress.ending ? 'Explora y relee tus recuerdos ✦'
    : progress.gateOpen ? 'Alguien te espera bajo el árbol rosado'
    : lit.every(Boolean) ? 'Ve a la cerca de flores, al norte'
    : `Reúne las 3 luces ✦ ${lit.filter(Boolean).length}/3`
  );

  const verbs = { sign: 'Leer', chest: 'Abrir', cat: 'Hablar', pedestal: 'Examinar', mailbox: 'Mensaje de hoy', gate: 'Mirar', boy: 'Abrazar' };
  const names = { sign: 'Letrero', chest: 'Cofre', cat: config.pregunta.npc, pedestal: 'Pedestal', mailbox: 'Buzón', gate: 'Cerca de flores', boy: config.yo };
  let nearVerb = $derived(near ? (near.type === 'chest' && progress.found[near.id] ? 'Ver recuerdo' : verbs[near.type]) : '');

  // ── Reglas del juego ─────────────────────────────────────────
  function interact(o) {
    if (ui.overlay) return;
    switch (o.type) {
      case 'sign':
        discover(o.id);
        sfx.select();
        note = o.data;
        ui.overlay = 'note';
        break;
      case 'chest': {
        const first = !progress.found[o.id];
        item = o.data;
        itemRevisit = !first;
        if (first) {
          discover(o.id);
          sfx.open();
          ui.overlay = 'opening';
          setTimeout(() => (ui.overlay = 'item'), 420);
        } else ui.overlay = 'item';
        break;
      }
      case 'cat':
        if (progress.quiz) say(config.pregunta.despues, config.pregunta.npc);
        else say(config.pregunta.saludo, config.pregunta.npc, () => (ui.overlay = 'quiz'));
        break;
      case 'pedestal':
        ui.overlay = 'puzzle';
        break;
      case 'mailbox':
        sfx.open();
        ui.overlay = 'message';
        break;
      case 'gate':
        if (lightsCount() < 3) {
          say([config.final.puerta, `Luces encendidas: ${lightsCount()} de 3.`], '✦');
        } else {
          engine.openGate();
          sfx.gate();
          save();
          say([config.final.abierta], '✦');
        }
        break;
      case 'boy':
        if (progress.ending) say(['Aquí sigo. Siempre.', '¿Quieres volver a leer la carta?'], config.yo, () => (ui.overlay = 'letter'));
        else beginEnding();
        break;
    }
  }

  function gainLight(text) {
    save();
    sfx.light();
    celebrate();
    const lines = [text];
    if (lightsCount() === 3) lines.push('Las 3 luces brillan juntas. La cerca de flores del norte ya puede abrirse ✦');
    say(lines, '✦');
  }

  function onStar(idx) {
    if (!discover(`estrella-${idx}`)) return;
    sfx.star();
    toast(config.estrellas.frases[idx]);
    if (starsFound() === 3) setTimeout(() => { if (!ui.overlay) gainLight(config.estrellas.premio); else pendingStar = true; }, 1600);
  }
  let pendingStar = false;

  function beginEnding() {
    cinema = true;
    near = null;
    setMusicMode('ending');
    engine.startEnding();
  }

  function celebrate() {
    if (reduced) return;
    const cols = ['#ffb3c7', '#ffd98a', '#c9b6ff', '#fff8ef', '#9fe0b0'];
    confetti = Array.from({ length: 36 }, (_, i) => ({
      id: Math.random(), c: cols[i % cols.length],
      x: (Math.random() - 0.5) * 520, y: -120 - Math.random() * 260, r: Math.random() * 720, d: Math.random() * 0.25,
    }));
    setTimeout(() => (confetti = []), 1800);
  }

  function finishDialogue() {
    const cb = ui.dialogue?.onDone;
    closeOverlay();
    cb?.();
    if (!ui.overlay && pendingStar) { pendingStar = false; gainLight(config.estrellas.premio); }
  }
  function closeAll() {
    closeOverlay();
    if (pendingStar) { pendingStar = false; gainLight(config.estrellas.premio); }
  }

  function toggleSound() {
    progress.sound = !progress.sound;
    initAudio();
    setSound(progress.sound);
    if (progress.sound) startMusic(progress.ending ? 'ending' : 'world');
    save();
  }
  function openJournal(tab = 'recuerdos') { journalTab = tab; ui.overlay = 'journal'; }

  // ── Teclado ─────────────────────────────────────────────────
  const KEYMAP = { ArrowUp: 'up', w: 'up', W: 'up', ArrowDown: 'down', s: 'down', S: 'down', ArrowLeft: 'left', a: 'left', A: 'left', ArrowRight: 'right', d: 'right', D: 'right' };
  function keydown(e) {
    if (!engine || ui.overlay || ui.scene !== 'world') return;
    if (KEYMAP[e.key]) { e.preventDefault(); engine.setKey(KEYMAP[e.key], true); return; }
    if (e.repeat) return;
    if ([' ', 'Enter', 'e', 'E', 'z', 'Z'].includes(e.key)) {
      if (document.activeElement && document.activeElement !== document.body && document.activeElement !== canvas && e.key !== ' ') return;
      e.preventDefault();
      engine.interact();
    } else if (e.key === 'j' || e.key === 'J') openJournal();
    else if (e.key === 'm' || e.key === 'M') toggleSound();
    else if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && !cinema) ui.overlay = 'pause';
  }
  function keyup(e) {
    if (engine && KEYMAP[e.key]) engine.setKey(KEYMAP[e.key], false);
  }

  // ── Ciclo de vida ───────────────────────────────────────────
  onMount(() => {
    engine = new Engine(canvas, {
      colors: config.personajes,
      progress,
      reducedMotion: reduced,
      hooks: {
        onInteract: interact,
        onStar,
        onNear: (o) => (near = o),
        onCutsceneEnd: () => {
          say(config.final.dialogo, config.yo, () => {
            progress.ending = true;
            discover('carta');
            save();
            sfx.light();
            ui.overlay = 'letter';
          });
        },
      },
    });
    engine.start();
    if (location.search.includes('debug')) window.__game = { engine, progress, ui };
    canvas.focus({ preventScroll: true });
    if (progress.sound) startMusic(progress.ending ? 'ending' : 'world');

    if (!progress.tutorialSeen) {
      setTimeout(() => {
        say([`Hola, ${config.ella}. Bienvenida a nuestro pequeño universo.`, touch ? config.tutorial.tactil : config.tutorial.teclado, config.tutorial.objetivo, config.estrellas.pista], '✦', () => {
          progress.tutorialSeen = true;
          save();
        });
      }, 900);
    }

    const onResize = () => engine.resize();
    const persist = () => { engine.savePos(); save(); };
    const iv = setInterval(persist, 2000);
    const onVis = () => document.visibilityState === 'hidden' && persist();
    const onBlur = () => engine.clearKeys();
    addEventListener('resize', onResize);
    addEventListener('orientationchange', onResize);
    addEventListener('pagehide', persist);
    addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      persist();
      engine.stop();
      clearInterval(iv);
      removeEventListener('resize', onResize);
      removeEventListener('orientationchange', onResize);
      removeEventListener('pagehide', persist);
      removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVis);
    };
  });

  $effect(() => {
    if (engine) {
      engine.paused = ui.overlay !== null;
      if (ui.overlay) engine.clearKeys();
    }
  });

  function pointer(e) {
    if (!engine || ui.overlay) return;
    initAudio();
    engine.tapAt(e.clientX, e.clientY);
  }
</script>

<svelte:window onkeydown={keydown} onkeyup={keyup} />

<section class="world" class:cinema>
  <canvas
    bind:this={canvas}
    tabindex="0"
    aria-label="Mundo de {config.title}. Usa las flechas para caminar y Espacio para interactuar."
    onpointerdown={pointer}
  ></canvas>
  <div class="vignette" aria-hidden="true"></div>

  <!-- HUD -->
  {#if !cinema}
    <div class="hud-left">
      <div class="lights glass-dark" role="group" aria-label="Luces encendidas: {lit.filter(Boolean).length} de 3">
        {#each [['✦', 'Estrellas'], ['❀', config.pregunta.npc], ['◈', 'Pedestal']] as [sym, label], i}
          <span class="slot" class:on={lit[i]} title={label}>
            <span class="sym" aria-hidden="true">{sym}</span>
            {#if i === 0 && !lit[0]}<span class="mini pixel" aria-hidden="true">{starsFound()}/3</span>{/if}
          </span>
        {/each}
      </div>
      <p class="objective pixel">{objective}</p>
    </div>

    <div class="hud-right">
      <button class="icon-btn" onclick={() => openJournal()} aria-label="Abrir diario ({unlocked} de {total} recuerdos)">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z" /><path d="M5 17a3 3 0 0 1 3-3h11" /><path d="M10 8h5" /></svg>
        <span class="badge pixel">{unlocked}</span>
      </button>
      <button class="icon-btn" onclick={toggleSound} aria-label={progress.sound ? 'Silenciar' : 'Activar sonido'} aria-pressed={progress.sound}>
        {#if progress.sound}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /></svg>
        {:else}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 9l5 6M22 9l-5 6" /></svg>
        {/if}
      </button>
      <button class="icon-btn" onclick={() => (ui.overlay = 'pause')} aria-label="Pausa y opciones">
        <svg viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
      </button>
    </div>

    {#if near && !ui.overlay && !touch}
      <div class="prompt glass-dark pixel" aria-hidden="true">
        <kbd>Espacio</kbd> {nearVerb} · <span>{names[near.type]}</span>
      </div>
    {/if}

    {#if touch && !ui.overlay}
      <TouchControls {engine} {near} verb={nearVerb} />
    {/if}
  {/if}

  <div class="sr-only" aria-live="polite">{near ? `Cerca: ${names[near.type]}. Pulsa Espacio para ${nearVerb}.` : ''}</div>

  {#if ui.toast}
    {#key ui.toast.key}
      <div class="toast glass" role="status">
        <span class="spark" aria-hidden="true">✦</span>{ui.toast.text}
      </div>
    {/key}
  {/if}

  {#if confetti.length}
    <div class="confetti" aria-hidden="true">
      {#each confetti as c (c.id)}
        <i style="--x:{c.x}px;--y:{c.y}px;--r:{c.r}deg;background:{c.c};animation-delay:{c.d}s"></i>
      {/each}
    </div>
  {/if}

  <!-- Overlays -->
  {#if ui.overlay === 'dialogue' && ui.dialogue}
    <Dialogue dialogue={ui.dialogue} onClose={finishDialogue} />
  {:else if ui.overlay === 'note' && note}
    <NoteCard {note} onClose={closeAll} />
  {:else if ui.overlay === 'item' && item}
    <ItemGet {item} revisit={itemRevisit} onClose={closeAll} />
  {:else if ui.overlay === 'quiz'}
    <Quiz onClose={closeAll} onWin={() => { progress.quiz = true; discover('pregunta'); closeOverlay(); gainLight(config.pregunta.premio); }} />
  {:else if ui.overlay === 'puzzle'}
    <Puzzle solvedBefore={progress.puzzle} onClose={closeAll} onWin={() => { progress.puzzle = true; discover('rompecabezas'); closeOverlay(); gainLight(config.rompecabezas.premio); }} />
  {:else if ui.overlay === 'journal'}
    <Journal initialTab={journalTab} onClose={closeAll} onOpenLetter={() => (ui.overlay = 'letter')} />
  {:else if ui.overlay === 'pause'}
    <PauseMenu
      sound={progress.sound}
      onResume={closeAll}
      onJournal={() => openJournal()}
      onSound={toggleSound}
      onMenu={() => { closeOverlay(); onMenu(); }}
      onReset={() => { closeOverlay(); onReset(); }}
    />
  {:else if ui.overlay === 'message'}
    <MessageCard {daily} onClose={closeAll} onHistory={() => openJournal('mensajes')} />
  {:else if ui.overlay === 'letter'}
    <FinalLetter
      onClose={() => { closeOverlay(); cinema = false; engine.endCutscene(); }}
      onJournal={() => { cinema = false; engine.endCutscene(); openJournal(); }}
    />
  {/if}
</section>

<style>
  .world { position: fixed; inset: 0; overflow: hidden; background: #1b1638; touch-action: none; user-select: none; -webkit-user-select: none; }
  canvas { display: block; image-rendering: pixelated; image-rendering: crisp-edges; outline: none; touch-action: none; cursor: pointer; }
  .vignette {
    position: absolute; inset: 0; pointer-events: none;
    background:
      radial-gradient(ellipse 75% 70% at 50% 50%, transparent 55%, rgba(27, 22, 56, 0.55) 100%),
      linear-gradient(180deg, rgba(255, 190, 150, 0.08), transparent 40%, rgba(90, 60, 160, 0.12));
  }
  .world::before, .world::after {
    content: ''; position: absolute; left: 0; right: 0; height: 0; background: #0b0820; z-index: 20;
    transition: height 1s ease; pointer-events: none;
  }
  .world::before { top: 0; }
  .world::after { bottom: 0; }
  .world.cinema::before, .world.cinema::after { height: 9vh; }

  .hud-left { position: absolute; z-index: 10; top: calc(12px + var(--safe-t)); left: calc(12px + var(--safe-l)); display: flex; flex-direction: column; gap: 8px; align-items: flex-start; animation: drop 0.6s ease 0.4s both; }
  .lights { display: flex; gap: 6px; padding: 6px; border-radius: 16px; }
  .slot {
    position: relative; width: 40px; height: 40px; display: grid; place-items: center;
    border-radius: 12px; background: rgba(0, 0, 0, 0.25); border: 1px dashed rgba(255, 255, 255, 0.25);
    color: rgba(255, 255, 255, 0.35); font-size: 1.15rem; transition: all 0.6s;
  }
  .slot.on {
    background: radial-gradient(circle, rgba(255, 217, 138, 0.9), rgba(255, 179, 199, 0.5));
    border: 1px solid #fff3c8; color: #5a2a10;
    box-shadow: 0 0 18px rgba(255, 217, 138, 0.8);
    animation: lit 0.8s cubic-bezier(.2,.9,.3,1.4);
  }
  .mini { position: absolute; bottom: -4px; right: -6px; font-size: 0.65rem; background: var(--noche); border-radius: 6px; padding: 0 4px; color: var(--texto); border: 1px solid rgba(255, 255, 255, 0.3); }
  .objective { margin: 0; font-size: 0.85rem; padding: 4px 10px; border-radius: 10px; background: rgba(27, 22, 56, 0.55); -webkit-backdrop-filter: blur(8px); backdrop-filter: blur(8px); max-width: 60vw; }
  .hud-right { position: absolute; z-index: 10; top: calc(12px + var(--safe-t)); right: calc(12px + var(--safe-r)); display: flex; gap: 8px; animation: drop 0.6s ease 0.5s both; }
  .badge { position: absolute; top: -6px; right: -6px; min-width: 22px; height: 22px; padding: 0 5px; border-radius: 11px; background: var(--acento-fuerte); color: #3a1430; font-size: 0.78rem; display: grid; place-items: center; border: 2px solid var(--noche); }

  .prompt {
    position: absolute; z-index: 10; left: 50%; bottom: calc(22px + var(--safe-b)); translate: -50% 0;
    padding: 8px 16px; border-radius: 14px; font-size: 1rem; white-space: nowrap;
    animation: up 0.25s ease both;
  }
  .prompt span { color: var(--acento); }
  kbd { font-family: var(--f-pixel); background: rgba(255, 255, 255, 0.85); color: var(--tinta); border-radius: 6px; padding: 1px 7px; margin-right: 4px; box-shadow: 0 2px 0 rgba(0, 0, 0, 0.4); }

  .toast {
    position: absolute; z-index: 25; left: 50%; top: calc(70px + var(--safe-t)); translate: -50% 0;
    width: max-content; max-width: min(520px, calc(100vw - 32px));
    padding: 12px 18px; border-radius: 16px; font-weight: 600; text-align: center;
    animation: toast 4.2s ease both;
  }
  .spark { color: var(--luz); margin-right: 8px; }

  .confetti { position: absolute; left: 50%; top: 50%; z-index: 50; pointer-events: none; }
  .confetti i { position: absolute; width: 8px; height: 8px; animation: conf 1.5s cubic-bezier(.2,.7,.4,1) both; }

  @keyframes drop { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: none; } }
  @keyframes up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  @keyframes lit { 0% { transform: scale(0.5); } 60% { transform: scale(1.3); } 100% { transform: scale(1); } }
  @keyframes toast { 0% { opacity: 0; transform: translateY(-14px) scale(0.95); } 8%, 88% { opacity: 1; transform: none; } 100% { opacity: 0; transform: translateY(-8px); } }
  @keyframes conf { 0% { transform: translate(0, 0) rotate(0); opacity: 1; } 100% { transform: translate(var(--x), calc(var(--y) + 380px)) rotate(var(--r)); opacity: 0; } }

  @media (max-width: 420px) {
    .slot { width: 36px; height: 36px; }
    .hud-right { gap: 6px; }
    .hud-right :global(.icon-btn) { width: 44px; height: 44px; }
  }
</style>
