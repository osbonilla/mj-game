<script>
  import { onMount } from 'svelte';
  import { config } from '../../config.js';
  import { buildObjectSprite } from '../game/sprites.js';
  import { sfx } from '../game/audio.js';
  let { onWin, onClose } = $props();

  const Q = config.pregunta.preguntas;
  let qi = $state(0);
  let wrong = $state(new Set());
  let reply = $state('');
  let mood = $state('idle'); // idle | wrong | right
  let fails = 0;
  let cat = $state('');
  let optsEl;
  const focusFirst = () => optsEl?.querySelector('.opt')?.focus();
  onMount(() => { cat = buildObjectSprite('cat').toDataURL(); focusFirst(); });

  let q = $derived(Q[qi]);

  function pick(i) {
    if (mood === 'right') return;
    if (i === q.correcta) {
      mood = 'right';
      reply = qi < Q.length - 1 ? '¡Miau! Correcto. Siguiente pregunta...' : config.pregunta.premio;
      sfx.right();
      setTimeout(() => {
        if (qi < Q.length - 1) { qi++; wrong = new Set(); mood = 'idle'; reply = ''; fails = 0; setTimeout(focusFirst, 30); }
        else onWin();
      }, 1500);
    } else {
      wrong = new Set([...wrong, i]);
      mood = 'wrong';
      reply = q.fallos[fails % q.fallos.length];
      fails++;
      sfx.wrong();
      setTimeout(() => { if (mood === 'wrong') mood = 'idle'; }, 500);
    }
  }
  function key(e) { if (e.key === 'Escape') onClose(); }
</script>

<svelte:window onkeydown={key} />

<div class="overlay-backdrop" role="presentation">
  <div class="quiz glass-dark" role="dialog" aria-modal="true" aria-labelledby="q-title">
    <button class="close icon-btn" onclick={onClose} aria-label="Cerrar y pensarlo luego">✕</button>
    <div class="head">
      <div class="cat" class:wrong={mood === 'wrong'} class:right={mood === 'right'}>
        {#if cat}<img src={cat} alt={config.pregunta.npc} />{/if}
      </div>
      <div>
        <p class="kicker pixel">La pregunta especial · {qi + 1}/{Q.length}</p>
        <h2 id="q-title" class="pixel">{q.texto}</h2>
      </div>
    </div>
    <div class="options" bind:this={optsEl}>
      {#each q.opciones as op, i (qi + '-' + i)}
        <button
          class="opt"
          class:no={wrong.has(i)}
          class:yes={mood === 'right' && i === q.correcta}
          onclick={() => pick(i)}
          aria-disabled={wrong.has(i)}
        >
          <span class="letter pixel" aria-hidden="true">{'ABCD'[i]}</span>{op}
        </button>
      {/each}
    </div>
    <p class="reply" class:right={mood === 'right'} aria-live="polite">{reply || 'Elige con el corazón. No hay prisa.'}</p>
  </div>
</div>

<style>
  .quiz { position: relative; width: min(560px, 100%); padding: 22px; animation: pop 0.45s cubic-bezier(.2,.9,.3,1.2) both; }
  .close { position: absolute; top: 10px; right: 10px; width: 44px; height: 44px; font-size: 1rem; }
  .head { display: flex; gap: 14px; align-items: center; padding-right: 44px; }
  .cat { flex: none; width: 72px; height: 72px; border-radius: 18px; background: rgba(255, 255, 255, 0.15); display: grid; place-items: center; border: 1px solid rgba(255, 255, 255, 0.3); }
  .cat img { width: 56px; height: 56px; image-rendering: pixelated; }
  .cat.wrong { animation: shake 0.4s; }
  .cat.right { animation: hop 0.5s ease 2; }
  .kicker { margin: 0; color: var(--acento); font-size: 0.9rem; }
  h2 { margin: 2px 0 0; font-size: clamp(1.2rem, 4.6vw, 1.5rem); font-weight: 600; line-height: 1.25; }
  .options { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 18px; }
  .opt {
    appearance: none; text-align: left; cursor: pointer;
    display: flex; gap: 10px; align-items: center;
    min-height: 56px; padding: 10px 14px;
    background: rgba(255, 255, 255, 0.12); border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 14px; color: var(--texto); font-weight: 600; font-size: 1rem;
    transition: background 0.2s, transform 0.15s;
  }
  .opt:hover { background: rgba(255, 255, 255, 0.22); }
  .opt:active { transform: scale(0.98); }
  .opt.no { opacity: 0.4; text-decoration: line-through; animation: shake 0.4s; }
  .opt.yes { background: linear-gradient(180deg, rgba(160, 240, 170, 0.5), rgba(90, 200, 120, 0.4)); border-color: #b9f5c4; }
  .letter { flex: none; width: 28px; height: 28px; display: grid; place-items: center; border-radius: 8px; background: rgba(255, 179, 199, 0.3); }
  .reply { margin: 16px 0 0; min-height: 3em; color: var(--texto-suave); font-style: italic; }
  .reply.right { color: var(--luz); font-style: normal; font-weight: 600; }
  @media (max-width: 460px) { .options { grid-template-columns: 1fr; } }
  @keyframes shake { 20%, 60% { transform: translateX(-5px); } 40%, 80% { transform: translateX(5px); } }
  @keyframes hop { 50% { transform: translateY(-8px); } }
  @keyframes pop { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: none; } }
</style>
