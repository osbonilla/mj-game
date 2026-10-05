<script>
  const openedAt = performance.now(); // evita que el mismo toque que abre, cierre
  import { onMount } from 'svelte';
  import { config } from '../../config.js';
  let { daily, onClose, onHistory = null } = $props();
  let btn;
  onMount(() => btn?.focus());
  function key(e) { if (e.key === 'Escape') onClose(); }
</script>

<svelte:window onkeydown={key} />

<div class="overlay-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && performance.now() - openedAt > 450 && onClose()}>
  <div class="card glass" role="dialog" aria-modal="true" aria-labelledby="msg-title">
    <div class="stamp pixel" aria-hidden="true">Nº {daily.number}</div>
    <p class="kicker pixel" id="msg-title">✉ Mensaje de hoy para {config.ella}</p>
    <div class="paper">
      <p class="text">{daily.text}</p>
      <p class="sign">— {config.yo}</p>
    </div>
    <p class="count">Mañana hay otro ✦</p>
    <div class="row">
      {#if onHistory}<button class="btn small ghost" onclick={onHistory}>Ver anteriores</button>{/if}
      <button class="btn small primary" bind:this={btn} onclick={onClose}>Guardar en mi corazón</button>
    </div>
  </div>
</div>

<style>
  .card {
    position: relative;
    width: min(440px, 100%);
    padding: 26px 22px 20px;
    text-align: center;
    animation: unfold 0.7s cubic-bezier(.2,.9,.3,1.1) both;
    transform-origin: 50% 0;
  }
  .kicker { margin: 0 0 14px; color: var(--acento); font-size: 1rem; }
  .paper {
    background: linear-gradient(180deg, #fff8ef, #fbeee0);
    color: var(--tinta);
    border-radius: 14px;
    padding: 24px 20px 18px;
    box-shadow: 0 10px 30px rgba(20, 8, 40, 0.35), inset 0 0 0 1px rgba(42, 27, 45, 0.08);
    background-image:
      repeating-linear-gradient(180deg, transparent 0 31px, rgba(122, 69, 150, 0.1) 31px 32px),
      linear-gradient(180deg, #fff8ef, #fbeee0);
  }
  .text { margin: 0; font-size: clamp(1.15rem, 4.6vw, 1.35rem); line-height: 1.55; font-weight: 600; animation: ink 1.2s ease 0.35s both; }
  .sign { margin: 14px 0 0; text-align: right; font-family: var(--f-pixel); color: #7a4596; animation: ink 1s ease 0.9s both; }
  .count { margin: 14px 0 0; font-size: 0.85rem; color: var(--texto-suave); }
  .row { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; margin-top: 14px; }
  .stamp {
    position: absolute; top: -14px; right: 16px;
    background: var(--acento-fuerte); color: #3a1430;
    padding: 4px 10px; border-radius: 10px; font-size: 0.9rem;
    border: 2px solid #fff4f7; rotate: 6deg;
    box-shadow: 0 6px 16px rgba(255, 127, 163, 0.4);
  }
  @keyframes unfold { from { opacity: 0; transform: perspective(700px) rotateX(-70deg) translateY(-20px); } to { opacity: 1; transform: none; } }
  @keyframes ink { from { opacity: 0; filter: blur(3px); } to { opacity: 1; filter: none; } }
</style>
