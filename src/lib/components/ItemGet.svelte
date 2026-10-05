<script>
  // Al abrir un cofre: el objeto sube con rayos de luz y luego se revela el recuerdo
  import { onMount, untrack } from 'svelte';
  import { sfx } from '../game/audio.js';
  import Photo from './Photo.svelte';
  let { item, onClose, revisit = false } = $props();
  let phase = $state(untrack(() => (revisit ? 'memory' : 'raise')));
  let btn = $state();
  let t;
  onMount(() => {
    if (phase === 'raise') {
      sfx.item();
      t = setTimeout(reveal, 1900);
    } else setTimeout(() => btn?.focus(), 50);
    return () => clearTimeout(t);
  });
  function reveal() {
    clearTimeout(t);
    if (phase === 'memory') return;
    phase = 'memory';
    setTimeout(() => btn?.focus(), 50);
  }
  function key(e) {
    if (e.repeat) return;
    if (phase === 'raise' && ['Enter', ' '].includes(e.key)) { e.preventDefault(); reveal(); }
    else if (e.key === 'Escape') onClose();
  }
</script>

<svelte:window onkeydown={key} />

<div class="overlay-backdrop" role="presentation">
  {#if phase === 'raise'}
    <button class="raise" onclick={reveal} aria-label="Has encontrado: {item.objeto}. Toca para ver el recuerdo">
      <div class="rays" aria-hidden="true"></div>
      <div class="obj" aria-hidden="true">
        <svg viewBox="0 0 16 16" shape-rendering="crispEdges">
          <rect x="2" y="1" width="12" height="14" fill="#2a1b2d" /><rect x="3" y="2" width="10" height="12" fill="#fff8ef" />
          <rect x="4" y="3" width="8" height="6" fill="#7a4596" /><rect x="4" y="7" width="8" height="2" fill="#3e7a45" />
          <rect x="9" y="4" width="2" height="2" fill="#fff3d6" /><rect x="5" y="10" width="6" height="1" fill="#c9b6ff" /><rect x="5" y="12" width="4" height="1" fill="#c9b6ff" />
        </svg>
      </div>
      <p class="got pixel">¡Encontraste <span>{item.objeto}</span>!</p>
    </button>
  {:else}
    <div class="memory glass" role="dialog" aria-modal="true" aria-labelledby="mem-title">
      <div class="polaroid">
        <Photo src={item.foto} alt={item.titulo} seed={item.id.length * 7} />
        {#if item.fecha}<p class="date pixel">{item.fecha}</p>{/if}
      </div>
      <div class="body">
        <p class="kicker pixel">Recuerdo desbloqueado</p>
        <h2 id="mem-title" class="pixel">{item.titulo}</h2>
        <p class="text">{item.texto}</p>
        <button class="btn small primary" bind:this={btn} onclick={onClose}>Guardar en el diario</button>
      </div>
    </div>
  {/if}
</div>

<style>
  .raise { appearance: none; background: none; border: 0; cursor: pointer; display: grid; place-items: center; position: relative; padding: 40px; }
  .rays {
    position: absolute; width: 520px; height: 520px; max-width: 140vw; max-height: 140vw;
    background: repeating-conic-gradient(from 0deg, rgba(255, 217, 138, 0.28) 0 10deg, transparent 10deg 24deg);
    -webkit-mask: radial-gradient(circle, #000 10%, transparent 62%);
    mask: radial-gradient(circle, #000 10%, transparent 62%);
    animation: spin 12s linear infinite, fadein 0.6s ease both;
  }
  .obj { width: 112px; height: 112px; position: relative; animation: lift 1s cubic-bezier(.2,.9,.3,1.3) both; filter: drop-shadow(0 0 22px rgba(255, 217, 138, 0.9)); }
  .obj svg { width: 100%; height: 100%; }
  .got { position: relative; margin: 26px 0 0; font-size: clamp(1.3rem, 5vw, 1.7rem); text-align: center; text-shadow: 0 2px 0 #2a1b2d; animation: fadein 0.6s ease 0.6s both; }
  .got span { color: var(--luz); }
  .memory {
    width: min(720px, 100%); max-height: 100%;
    display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1.1fr); gap: 22px;
    padding: 22px; overflow-y: auto;
    animation: pop 0.55s cubic-bezier(.2,.9,.3,1.2) both;
  }
  .polaroid { background: #fff8ef; padding: 10px 10px 12px; border-radius: 6px; rotate: -2deg; box-shadow: 0 14px 30px rgba(10, 4, 40, 0.4); align-self: start; }
  .date { margin: 8px 0 0; text-align: center; color: #7a4596; font-size: 0.95rem; }
  .kicker { margin: 0; color: var(--acento); font-size: 0.95rem; }
  h2 { margin: 4px 0 10px; font-size: clamp(1.35rem, 4.6vw, 1.7rem); font-weight: 600; line-height: 1.2; }
  .text { margin: 0 0 18px; white-space: pre-line; font-size: 1.05rem; }
  @media (max-width: 600px) {
    .memory { grid-template-columns: 1fr; gap: 16px; padding: 18px; }
    .polaroid { width: 82%; justify-self: center; }
  }
  @keyframes spin { to { rotate: 360deg; } }
  @keyframes fadein { from { opacity: 0; } to { opacity: 1; } }
  @keyframes lift { from { opacity: 0; transform: translateY(60px) scale(0.4); } to { opacity: 1; transform: none; } }
  @keyframes pop { from { opacity: 0; transform: scale(0.9) translateY(20px); } to { opacity: 1; transform: none; } }
</style>
