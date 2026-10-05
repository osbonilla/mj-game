<script>
  import { onMount } from 'svelte';
  import { config } from '../../config.js';
  import { progress, save } from '../game/state.svelte.js';
  import { sceneDataURL } from '../game/illustration.js';
  import { initAudio, setSound, sfx } from '../game/audio.js';
  import StarSky from './StarSky.svelte';
  import MessageCard from './MessageCard.svelte';

  let { daily, onStart } = $props();

  let island = $state('');
  let showMessage = $state(false);
  let opened = $state(false);
  const words = config.title.split(' ').map((w, wi, arr) => ({ w, offset: arr.slice(0, wi).join(' ').length + (wi ? 1 : 0) }));

  const days = (() => {
    if (!config.fechaEspecial) return null;
    const d = new Date(config.fechaEspecial + 'T00:00:00');
    if (isNaN(d)) return null;
    return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000));
  })();

  onMount(() => {
    island = sceneDataURL(96, 84, { island: true, seed: 3 });
  });

  function toggleSound() {
    progress.sound = !progress.sound;
    initAudio();
    setSound(progress.sound);
    if (progress.sound) sfx.select();
    save();
  }
  function openMessage() {
    initAudio();
    setSound(progress.sound);
    sfx.open();
    showMessage = true;
    opened = true;
  }
</script>

<section class="menu" aria-labelledby="title">
  <StarSky />

  <button class="sound icon-btn" onclick={toggleSound} aria-pressed={progress.sound} aria-label={progress.sound ? 'Silenciar sonido' : 'Activar sonido'}>
    {#if progress.sound}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M16.5 8.5a5 5 0 0 1 0 7" /><path d="M19 6a8.5 8.5 0 0 1 0 12" /></svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 9v6h4l5 4V5L8 9H4z" /><path d="M17 9l5 6M22 9l-5 6" /></svg>
    {/if}
    <span class="sound-label pixel">{progress.sound ? 'Sonido' : 'Silencio'}</span>
  </button>

  <div class="content">
    <div class="island-wrap" aria-hidden="true">
      <div class="halo"></div>
      {#if island}<img class="island" src={island} alt="" />{/if}
    </div>

    <h1 id="title" class="title pixel" aria-label={config.title}>
      {#each words as word}
        <span class="word" aria-hidden="true">{#each [...word.w] as l, i}<span style="animation-delay:{0.35 + (word.offset + i) * 0.055}s">{l}</span>{/each}</span>
      {/each}
    </h1>
    <p class="subtitle">{config.subtitle}</p>
    {#if days !== null}
      <p class="days pixel">✦ {days} {config.textoFecha} ✦</p>
    {/if}

    <button class="envelope glass" class:opened onclick={openMessage}>
      <span class="env-icon" aria-hidden="true">
        <svg viewBox="0 0 32 24" shape-rendering="crispEdges"><rect x="1" y="3" width="30" height="20" fill="#fff4e6" stroke="#2a1b2d" stroke-width="2"/><path d="M2 4 L16 15 L30 4" fill="none" stroke="#2a1b2d" stroke-width="2"/><rect x="13" y="12" width="6" height="5" fill="#ff7fa3"/></svg>
        {#if !opened}<span class="dot"></span>{/if}
      </span>
      <span class="env-text">
        <strong class="pixel">{opened ? 'Mensaje de hoy' : config.inicio.mensajeNuevo}</strong>
        <small>Tócalo para leer</small>
      </span>
    </button>

    <div class="actions">
      <button class="btn primary start" onclick={onStart}>
        {progress.started ? config.inicio.botonContinuar : config.inicio.boton}
      </button>
    </div>
    <p class="hint">Mejor con sonido 🎧 · funciona en el celu y en la compu</p>
  </div>

  {#if showMessage}
    <MessageCard {daily} onClose={() => (showMessage = false)} />
  {/if}
</section>

<style>
  .menu { position: fixed; inset: 0; display: grid; place-items: center; overflow: hidden; }
  .content {
    position: relative; z-index: 2;
    display: flex; flex-direction: column; align-items: center; text-align: center;
    padding: calc(24px + var(--safe-t)) 20px calc(24px + var(--safe-b));
    width: min(560px, 100%);
    max-height: 100%;
  }
  .island-wrap { position: relative; width: min(300px, 62vw, 34vh); aspect-ratio: 96 / 84; margin-bottom: 6px; }
  .island {
    width: 100%; height: 100%; image-rendering: pixelated; position: relative;
    animation: float 6s ease-in-out infinite, appear 1.2s ease both;
    filter: drop-shadow(0 18px 30px rgba(255, 127, 163, 0.25));
  }
  .halo {
    position: absolute; inset: -20%;
    background: radial-gradient(circle, rgba(255, 217, 138, 0.25), transparent 60%);
    animation: pulse 5s ease-in-out infinite;
  }
  .title {
    margin: 0;
    font-size: clamp(2rem, 7vw, 3.4rem);
    font-weight: 600;
    line-height: 1.08;
    letter-spacing: 0.01em;
    text-shadow: 0 0 22px rgba(255, 179, 199, 0.55), 0 3px 0 #2a1b2d;
  }
  .title .word { display: inline-block; white-space: nowrap; margin: 0 0.18em; }
  .title .word span { display: inline-block; animation: letter 0.7s cubic-bezier(.2,.9,.3,1.3) both; }
  .subtitle {
    margin: 10px 0 0; color: var(--texto-suave); max-width: 30ch;
    font-size: clamp(1rem, 3.6vw, 1.12rem);
    animation: fade 1s ease 1.6s both;
  }
  .days { margin: 8px 0 0; color: var(--luz); font-size: 0.95rem; animation: fade 1s ease 1.9s both; }
  .envelope {
    margin-top: 22px;
    display: flex; align-items: center; gap: 14px;
    padding: 12px 18px 12px 14px;
    text-align: left; cursor: pointer;
    border-radius: 18px;
    animation: rise 0.9s ease 2.1s both;
    transition: transform 0.2s ease;
    min-height: 64px;
  }
  .envelope:hover { transform: translateY(-2px); }
  .envelope:not(.opened) { animation: rise 0.9s ease 2.1s both, wiggle 4s ease-in-out 3.5s infinite; }
  .env-icon { position: relative; width: 40px; flex: none; }
  .env-icon svg { width: 40px; display: block; }
  .dot { position: absolute; top: -4px; right: -4px; width: 12px; height: 12px; border-radius: 50%; background: var(--acento-fuerte); box-shadow: 0 0 0 3px rgba(255, 127, 163, 0.3); animation: pulse 1.6s infinite; }
  .env-text { display: flex; flex-direction: column; line-height: 1.3; }
  .env-text strong { font-size: 1.05rem; font-weight: 600; }
  .env-text small { color: var(--texto-suave); font-size: 0.85rem; }
  .actions { margin-top: 18px; animation: rise 0.9s ease 2.4s both; }
  .start { font-size: clamp(1rem, 4.2vw, 1.15rem); padding: 0.9em 1.6em; white-space: nowrap; }
  .hint { margin: 14px 0 0; font-size: 0.82rem; color: rgba(233, 223, 255, 0.7); animation: fade 1s ease 2.8s both; }
  .sound {
    position: absolute; z-index: 3;
    top: calc(14px + var(--safe-t)); right: calc(14px + var(--safe-r));
    width: auto; padding: 0 14px; gap: 8px; display: flex; align-items: center;
  }
  .sound-label { font-size: 0.9rem; }

  @keyframes letter { from { opacity: 0; transform: translateY(14px) scale(0.6); filter: blur(4px); } to { opacity: 1; transform: none; filter: none; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
  @keyframes appear { from { opacity: 0; transform: scale(0.85); } to { opacity: 1; transform: none; } }
  @keyframes float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -10px; } }
  @keyframes pulse { 0%, 100% { opacity: 0.7; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
  @keyframes wiggle { 0%, 90%, 100% { rotate: 0deg; } 93% { rotate: -2deg; } 96% { rotate: 2deg; } }

  @media (max-height: 640px) {
    .island-wrap { width: min(200px, 26vh); }
    .envelope { margin-top: 14px; }
  }
</style>
