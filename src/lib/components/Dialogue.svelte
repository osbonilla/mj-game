<script>
  import { onMount } from 'svelte';
  import { sfx } from '../game/audio.js';
  let { dialogue, onClose } = $props();

  const openedAt = performance.now();
  let idx = $state(0);
  let shown = $state(0);
  let timer;
  let box;
  const reduced = typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;

  let line = $derived(dialogue.lines[idx] ?? '');
  let done = $derived(shown >= line.length);

  function type() {
    clearInterval(timer);
    shown = reduced ? line.length : 0;
    if (reduced) return;
    timer = setInterval(() => {
      shown = Math.min(line.length, shown + 1);
      if (shown % 3 === 0) sfx.blip();
      if (shown >= line.length) clearInterval(timer);
    }, 26);
  }
  function advance() {
    if (!done) { shown = line.length; clearInterval(timer); return; }
    if (idx < dialogue.lines.length - 1) { idx++; type(); sfx.select(); }
    else { clearInterval(timer); onClose(); }
  }
  onMount(() => { type(); box?.focus(); return () => clearInterval(timer); });

  function key(e) {
    if (e.repeat) return;
    if (['Enter', ' ', 'z', 'Z', 'e', 'E', 'Escape'].includes(e.key)) { e.preventDefault(); advance(); }
  }
</script>

<svelte:window onkeydown={key} />

<div class="wrap">
  <button class="box glass-dark" bind:this={box} onclick={() => performance.now() - openedAt > 350 && advance()} aria-label={dialogue.speaker ? `${dialogue.speaker} dice: ${line}` : line}>
    {#if dialogue.speaker}<span class="speaker pixel">{dialogue.speaker}</span>{/if}
    <span class="text" aria-hidden="true">{line.slice(0, shown)}<span class="ghost">{line.slice(shown)}</span></span>
    <span class="more pixel" class:visible={done} aria-hidden="true">{idx < dialogue.lines.length - 1 ? '▼' : '✦'}</span>
  </button>
</div>

<style>
  .wrap {
    position: fixed; z-index: 30; left: 0; right: 0;
    bottom: calc(14px + var(--safe-b));
    display: flex; justify-content: center;
    padding: 0 calc(12px + var(--safe-r)) 0 calc(12px + var(--safe-l));
    animation: up 0.35s cubic-bezier(.2,.9,.3,1.2) both;
  }
  .box {
    appearance: none; position: relative; text-align: left; cursor: pointer;
    width: min(760px, 100%);
    min-height: 120px;
    padding: 26px 22px 22px;
    color: var(--texto);
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 3px rgba(42, 27, 45, 0.55), var(--glass-shadow);
  }
  .speaker {
    position: absolute; top: -16px; left: 18px;
    background: linear-gradient(180deg, #ffc4d4, #ff8fb1);
    color: #3a1430;
    padding: 3px 14px;
    border-radius: 10px;
    border: 2px solid #2a1b2d;
    font-size: 1rem;
  }
  .text { display: block; font-size: clamp(1.05rem, 4vw, 1.2rem); line-height: 1.55; white-space: pre-line; font-weight: 600; }
  .ghost { visibility: hidden; }
  .more { position: absolute; right: 18px; bottom: 10px; color: var(--luz); opacity: 0; font-size: 0.9rem; }
  .more.visible { opacity: 1; animation: bob 0.9s ease-in-out infinite; }
  @keyframes up { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: none; } }
  @keyframes bob { 50% { transform: translateY(3px); } }
</style>
