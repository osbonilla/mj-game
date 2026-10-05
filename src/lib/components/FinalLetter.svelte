<script>
  import { onMount } from 'svelte';
  import { config } from '../../config.js';
  import { sfx } from '../game/audio.js';
  let { onClose, onJournal } = $props();
  let opened = $state(false);
  let seal = $state();
  const paragraphs = config.carta.texto.split(/\n\s*\n/);
  const petals = Array.from({ length: 18 }, (_, i) => ({ l: (i * 53) % 100, d: (i * 0.7) % 9, s: 7 + (i % 5) * 2, dur: 9 + (i % 4) * 2 }));
  onMount(() => seal?.focus());
  function openIt() { opened = true; sfx.open(); setTimeout(() => sfx.light(), 500); }
  function key(e) { if (e.key === 'Escape') onClose(); }
</script>

<svelte:window onkeydown={key} />

<div class="overlay-backdrop final" role="presentation">
  <div class="petals" aria-hidden="true">
    {#each petals as p}<i style="left:{p.l}%;animation-delay:-{p.d}s;width:{p.s}px;height:{p.s}px;animation-duration:{p.dur}s"></i>{/each}
  </div>

  {#if !opened}
    <button class="envelope" bind:this={seal} onclick={openIt} aria-label="Abrir la carta">
      <span class="flap" aria-hidden="true"></span>
      <span class="wax pixel" aria-hidden="true">✦</span>
      <span class="label pixel">Para {config.ella}</span>
      <span class="tap">toca para abrir</span>
    </button>
  {:else}
    <article class="letter" aria-labelledby="letter-title">
      <h2 id="letter-title" class="pixel">{config.carta.titulo}</h2>
      {#each paragraphs as p, i}
        <p style="animation-delay:{0.6 + i * 0.9}s">{p}</p>
      {/each}
      <p class="sign" style="animation-delay:{0.8 + paragraphs.length * 0.9}s">{config.carta.firma}<br /><strong class="pixel">{config.yo}</strong></p>
      <div class="actions" style="animation-delay:{1.2 + paragraphs.length * 0.9}s">
        <button class="btn small ghost dark" onclick={onJournal}>Ver nuestro diario</button>
        <button class="btn small primary" onclick={onClose}>Volver a explorar</button>
      </div>
    </article>
  {/if}
</div>

<style>
  .final { background: radial-gradient(ellipse at 50% 60%, rgba(255, 179, 199, 0.25), rgba(14, 8, 40, 0.75)); z-index: 45; }
  .petals { position: fixed; inset: 0; pointer-events: none; overflow: hidden; }
  .petals i { position: absolute; top: -20px; background: #ffc6dc; border-radius: 70% 0 70% 0; opacity: 0.85; animation: fall linear infinite; }
  .envelope {
    appearance: none; cursor: pointer; position: relative;
    width: min(340px, 86vw); aspect-ratio: 1.45;
    background: linear-gradient(180deg, #fff3f6, #ffd9e4);
    border: 3px solid #2a1b2d; border-radius: 10px;
    box-shadow: 0 30px 60px rgba(10, 4, 40, 0.5), 0 0 80px rgba(255, 179, 199, 0.5);
    animation: arrive 1s cubic-bezier(.2,.9,.3,1.2) both, breathe 3s ease-in-out 1s infinite;
    overflow: hidden;
  }
  .flap {
    position: absolute; inset: 0 0 auto 0; height: 58%;
    background: linear-gradient(180deg, #ffd1e1, #ffb3c7);
    clip-path: polygon(0 0, 100% 0, 50% 100%);
    border-bottom: 3px solid #2a1b2d;
  }
  .wax {
    position: absolute; left: 50%; top: 50%; translate: -50% -50%;
    width: 58px; height: 58px; border-radius: 50%; display: grid; place-items: center;
    background: radial-gradient(circle at 35% 30%, #ff9ab6, #d6336c 65%, #8e1d48);
    color: #ffe3ec; font-size: 1.6rem; border: 3px solid #2a1b2d;
    box-shadow: 0 6px 14px rgba(0, 0, 0, 0.3);
  }
  .label { position: absolute; left: 0; right: 0; bottom: 30px; color: #7a2e55; font-size: 1.15rem; }
  .tap { position: absolute; left: 0; right: 0; bottom: 10px; color: #a0557a; font-size: 0.8rem; }
  .letter {
    position: relative;
    width: min(620px, 100%); max-height: 100%; overflow-y: auto;
    padding: clamp(24px, 6vw, 44px);
    color: var(--tinta);
    background:
      repeating-linear-gradient(180deg, transparent 0 33px, rgba(122, 69, 150, 0.1) 33px 34px),
      linear-gradient(180deg, rgba(255, 250, 242, 0.96), rgba(255, 238, 230, 0.93));
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.9);
    box-shadow: 0 30px 70px rgba(10, 4, 40, 0.5), 0 0 0 6px rgba(255, 255, 255, 0.18), 0 0 100px rgba(255, 179, 199, 0.4);
    animation: unfold 0.9s cubic-bezier(.2,.9,.3,1.1) both;
    transform-origin: 50% 0;
  }
  h2 { margin: 0 0 18px; text-align: center; font-size: clamp(1.8rem, 6vw, 2.4rem); font-weight: 600; color: #b0457a; }
  .letter p { margin: 0 0 16px; font-size: clamp(1.05rem, 4vw, 1.18rem); line-height: 1.75; animation: ink 1.1s ease both; }
  .sign { text-align: right; color: #7a4596; }
  .sign strong { font-size: 1.3rem; font-weight: 600; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; margin-top: 10px; animation: ink 1s ease both; }
  .dark { color: var(--tinta); border-color: rgba(42, 27, 45, 0.3); }
  @keyframes fall { to { transform: translate(-80px, 110vh) rotate(540deg); } }
  @keyframes arrive { from { opacity: 0; transform: translateY(80px) rotate(-8deg) scale(0.7); } to { opacity: 1; transform: none; } }
  @keyframes breathe { 50% { transform: scale(1.03); } }
  @keyframes unfold { from { opacity: 0; transform: perspective(900px) rotateX(-80deg); } to { opacity: 1; transform: none; } }
  @keyframes ink { from { opacity: 0; transform: translateY(6px); filter: blur(3px); } to { opacity: 1; transform: none; filter: none; } }
</style>
