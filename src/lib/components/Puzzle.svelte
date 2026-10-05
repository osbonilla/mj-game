<script>
  import { onMount, untrack } from 'svelte';
  import { config } from '../../config.js';
  import { sceneDataURL } from '../game/illustration.js';
  import { sfx } from '../game/audio.js';
  let { solvedBefore = false, onWin, onClose } = $props();

  const N = 3;
  let img = $state('');
  let order = $state([...Array(N * N).keys()]);
  let sel = $state(null);
  let solved = $state(untrack(() => solvedBefore));
  let moves = $state(0);
  let gridEl;

  function shuffle() {
    let a;
    do {
      a = [...Array(N * N).keys()];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
    } while (a.filter((v, i) => v === i).length > 2);
    order = a;
  }
  onMount(() => {
    img = sceneDataURL(96, 96, { seed: 9 });
    if (!solved) shuffle();
    setTimeout(() => gridEl?.querySelector('button')?.focus(), 60);
  });

  function tap(pos) {
    if (solved) return;
    if (sel === null) { sel = pos; sfx.select(); return; }
    if (sel === pos) { sel = null; return; }
    const a = [...order];
    [a[sel], a[pos]] = [a[pos], a[sel]];
    order = a;
    sel = null;
    moves++;
    sfx.swap();
    if (order.every((v, i) => v === i)) {
      solved = true;
      setTimeout(() => sfx.right(), 200);
    }
  }
  function key(e) { if (e.key === 'Escape') onClose(); }
</script>

<svelte:window onkeydown={key} />

<div class="overlay-backdrop" role="presentation">
  <div class="panel glass-dark" role="dialog" aria-modal="true" aria-labelledby="pz-title">
    <button class="close icon-btn" onclick={onClose} aria-label="Cerrar">✕</button>
    <p class="kicker pixel">Pedestal antiguo</p>
    <h2 id="pz-title" class="pixel">{solved ? 'Nuestro árbol' : 'La imagen rota'}</h2>
    {#if !solved}<p class="help">{config.rompecabezas.intro}</p>{/if}

    <div class="grid" class:solved bind:this={gridEl} style="--img:url({img})">
      {#each order as piece, pos (piece)}
        <button
          class="piece"
          class:sel={sel === pos}
          style="background-position:{(piece % N) * 50}% {Math.floor(piece / N) * 50}%"
          onclick={() => tap(pos)}
          aria-label="Pieza {piece + 1} en la casilla {pos + 1}{sel === pos ? ', seleccionada' : ''}"
          disabled={solved}
        ></button>
      {/each}
    </div>

    {#if solved}
      <p class="win" aria-live="polite">{config.rompecabezas.premio}</p>
      <button class="btn small primary" onclick={solvedBefore ? onClose : onWin}>{solvedBefore ? 'Cerrar' : 'Recoger la luz ✦'}</button>
    {:else}
      <p class="moves pixel" aria-live="polite">Movimientos: {moves}</p>
    {/if}
  </div>
</div>

<style>
  .panel { position: relative; width: min(440px, 100%); padding: 22px; text-align: center; animation: pop 0.45s cubic-bezier(.2,.9,.3,1.2) both; max-height: 100%; overflow-y: auto; }
  .close { position: absolute; top: 10px; right: 10px; width: 44px; height: 44px; }
  .kicker { margin: 0; color: var(--acento); font-size: 0.9rem; }
  h2 { margin: 2px 0 6px; font-size: 1.5rem; font-weight: 600; }
  .help { margin: 0 0 14px; color: var(--texto-suave); font-size: 0.98rem; }
  .grid {
    --gap: 4px;
    width: min(320px, 100%, 52vh); aspect-ratio: 1; margin: 0 auto;
    display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--gap);
    padding: 6px; border-radius: 14px; background: rgba(42, 27, 45, 0.6);
    transition: gap 0.6s ease, padding 0.6s ease;
  }
  .grid.solved { --gap: 0px; padding: 0; box-shadow: 0 0 0 3px var(--luz), 0 0 50px rgba(255, 217, 138, 0.6); animation: glow 2s ease-in-out infinite; }
  .piece {
    appearance: none; border: 0; padding: 0; cursor: pointer;
    background-image: var(--img); background-size: 300% 300%;
    image-rendering: pixelated;
    border-radius: 6px;
    transition: transform 0.18s ease, box-shadow 0.18s ease, border-radius 0.6s;
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  }
  .grid.solved .piece { border-radius: 0; box-shadow: none; cursor: default; }
  .piece:hover:not(:disabled) { transform: scale(1.03); }
  .piece.sel { transform: scale(0.92); box-shadow: 0 0 0 3px var(--acento-fuerte), 0 0 18px rgba(255, 127, 163, 0.7); }
  .win { margin: 16px 0 14px; font-weight: 600; color: var(--luz); }
  .moves { margin: 12px 0 0; color: var(--texto-suave); font-size: 0.9rem; }
  @keyframes pop { from { opacity: 0; transform: scale(0.92); } to { opacity: 1; transform: none; } }
  @keyframes glow { 50% { box-shadow: 0 0 0 3px var(--luz), 0 0 70px rgba(255, 217, 138, 0.85); } }
</style>
