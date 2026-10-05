<script>
  const openedAt = performance.now(); // evita que el mismo toque que abre, cierre
  // Notita romántica que se despliega al leer un letrero
  import { onMount } from 'svelte';
  let { note, onClose } = $props();
  let btn;
  onMount(() => btn?.focus());
  function key(e) { if (e.key === 'Escape') onClose(); }
</script>

<svelte:window onkeydown={key} />

<div class="overlay-backdrop soft" role="presentation" onclick={(e) => e.target === e.currentTarget && performance.now() - openedAt > 450 && onClose()}>
  <div class="note" role="dialog" aria-modal="true" aria-labelledby="note-title">
    <div class="pin" aria-hidden="true"></div>
    <p class="where pixel" id="note-title">✦ {note.titulo}</p>
    <p class="text">{note.texto}</p>
    <button class="btn small primary" bind:this={btn} onclick={onClose}>Seguir el camino</button>
  </div>
</div>

<style>
  .soft { background: radial-gradient(ellipse at center, rgba(20, 12, 50, 0.15), rgba(10, 6, 30, 0.55)); }
  .note {
    position: relative;
    width: min(380px, 100%);
    padding: 34px 26px 22px;
    text-align: center;
    color: var(--tinta);
    background:
      linear-gradient(180deg, rgba(255, 250, 240, 0.92), rgba(255, 236, 222, 0.85));
    -webkit-backdrop-filter: blur(12px);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 6px 6px 18px 18px;
    box-shadow: 0 20px 50px rgba(12, 6, 40, 0.45), 0 0 0 4px rgba(138, 90, 58, 0.55), 0 0 0 7px rgba(42, 27, 45, 0.6);
    animation: drop 0.6s cubic-bezier(.2,.9,.3,1.3) both;
    transform-origin: 50% -40px;
  }
  .pin {
    position: absolute; top: -12px; left: 50%; translate: -50% 0;
    width: 22px; height: 22px; border-radius: 50%;
    background: radial-gradient(circle at 35% 35%, #ffd1e1, #ff7fa3 60%, #b0457a);
    border: 2px solid #2a1b2d;
  }
  .where { margin: 0 0 10px; color: #7a4596; font-size: 1rem; }
  .text { margin: 0 0 18px; font-size: clamp(1.1rem, 4.4vw, 1.25rem); font-weight: 600; line-height: 1.55; }
  @keyframes drop { 0% { opacity: 0; transform: rotate(-8deg) translateY(-30px); } 60% { transform: rotate(2deg); } 100% { opacity: 1; transform: rotate(-1deg); } }
</style>
