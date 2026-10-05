<script>
  const openedAt = performance.now(); // evita que el mismo toque que abre, cierre
  import { onMount } from 'svelte';
  let { sound, onResume, onJournal, onSound, onMenu, onReset } = $props();
  let confirming = $state(false);
  let first = $state();
  onMount(() => first?.focus());
  function key(e) { if (e.key === 'Escape') { if (confirming) confirming = false; else onResume(); } }
</script>

<svelte:window onkeydown={key} />

<div class="overlay-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && performance.now() - openedAt > 450 && onResume()}>
  <div class="pause glass-dark" role="dialog" aria-modal="true" aria-labelledby="p-title">
    {#if !confirming}
      <h2 id="p-title" class="pixel">Pausa</h2>
      <button class="btn primary" bind:this={first} onclick={onResume}>Continuar</button>
      <button class="btn" onclick={onJournal}>Diario de recuerdos</button>
      <button class="btn" onclick={onSound} aria-pressed={sound}>Sonido: {sound ? 'activado' : 'silenciado'}</button>
      <button class="btn" onclick={onMenu}>Volver a la portada</button>
      <button class="btn ghost danger" onclick={() => (confirming = true)}>Reiniciar aventura</button>
      <p class="keys">Teclado: flechas/WASD · Espacio interactuar · J diario · M sonido · Esc pausa</p>
    {:else}
      <h2 id="p-title" class="pixel">¿Empezar de cero?</h2>
      <p>Se borrará el progreso del juego (recuerdos, luces y el final). Los mensajes diarios se conservan.</p>
      <button class="btn primary" onclick={onReset}>Sí, reiniciar</button>
      <button class="btn" onclick={() => (confirming = false)}>No, mejor no</button>
    {/if}
  </div>
</div>

<style>
  .pause { width: min(360px, 100%); padding: 22px; display: flex; flex-direction: column; gap: 10px; text-align: center; animation: pop 0.35s ease both; }
  h2 { margin: 0 0 6px; font-size: 1.6rem; font-weight: 600; }
  p { margin: 0 0 6px; color: var(--texto-suave); }
  .danger { color: #ffc0cf; }
  .keys { font-size: 0.78rem; margin-top: 6px; opacity: 0.75; }
  @media (pointer: coarse) { .keys { display: none; } }
  @keyframes pop { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: none; } }
</style>
