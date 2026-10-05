<script>
  import { onMount } from 'svelte';
  import { config } from '../../config.js';
  import StarSky from './StarSky.svelte';
  let { onDone } = $props();
  let i = $state(0);
  let timer;
  const lines = config.intro;

  function next() {
    clearTimeout(timer);
    if (i < lines.length - 1) { i++; schedule(); }
    else onDone();
  }
  function schedule() {
    timer = setTimeout(next, 3200 + lines[i].length * 30);
  }
  onMount(() => { schedule(); return () => clearTimeout(timer); });
  function key(e) {
    if (['Enter', ' ', 'ArrowRight'].includes(e.key)) { e.preventDefault(); next(); }
    if (e.key === 'Escape') onDone();
  }
</script>

<svelte:window onkeydown={key} />

<section class="intro" aria-live="polite">
  <StarSky density={0.6} />
  <button class="tap" onclick={next} aria-label="Siguiente">
    {#key i}
      <p class="line pixel">{lines[i]}</p>
    {/key}
  </button>
  <div class="dots" aria-hidden="true">
    {#each lines as _, k}<span class:on={k <= i}></span>{/each}
  </div>
  <button class="btn small ghost skip" onclick={onDone}>Saltar ›</button>
</section>

<style>
  .intro { position: fixed; inset: 0; display: grid; place-items: center; }
  .tap {
    position: relative; z-index: 2; appearance: none; background: none; border: 0;
    width: 100%; height: 100%; display: grid; place-items: center; padding: 24px; cursor: pointer;
  }
  .line {
    margin: 0; max-width: 24ch; text-align: center;
    font-size: clamp(1.35rem, 5.4vw, 2.1rem); line-height: 1.35;
    text-shadow: 0 0 24px rgba(255, 179, 199, 0.45);
    animation: in 1.4s ease both;
  }
  .dots { position: absolute; z-index: 2; bottom: calc(80px + var(--safe-b)); display: flex; gap: 8px; }
  .dots span { width: 8px; height: 8px; background: rgba(255, 255, 255, 0.25); transition: background 0.4s; }
  .dots span.on { background: var(--acento); }
  .skip { position: absolute; z-index: 3; bottom: calc(18px + var(--safe-b)); right: calc(18px + var(--safe-r)); }
  @keyframes in { from { opacity: 0; transform: translateY(10px); filter: blur(6px); } to { opacity: 1; transform: none; filter: none; } }
</style>
