<script>
  const openedAt = performance.now(); // evita que el mismo toque que abre, cierre
  import { onMount, untrack } from 'svelte';
  import { config } from '../../config.js';
  import { progress, catalog } from '../game/state.svelte.js';
  import { readMessages } from '../game/daily.js';
  import { sceneDataURL } from '../game/illustration.js';
  import Photo from './Photo.svelte';
  let { onClose, onOpenLetter, initialTab = 'recuerdos' } = $props();

  const items = catalog();
  const msgs = readMessages();
  let tab = $state(untrack(() => initialTab));
  let open = $state(null);
  let scene = $state('');
  let closeBtn = $state();
  let unlocked = $derived(items.filter((it) => progress.found[it.id]).length);
  onMount(() => { scene = sceneDataURL(96, 72, { seed: 9 }); closeBtn?.focus(); });

  const icon = { nota: '✎', foto: '▣', estrella: '✦', insignia: '❀', dibujo: '◈', carta: '✉' };
  const kindName = { nota: 'Notita', foto: 'Recuerdo', estrella: 'Estrella', insignia: 'Insignia', dibujo: 'Dibujo', carta: 'Carta' };

  function select(it) {
    if (!progress.found[it.id]) return;
    if (it.kind === 'carta') { onOpenLetter(); return; }
    open = it;
  }
  function key(e) {
    if (e.key === 'Escape') { if (open) open = null; else onClose(); }
  }
</script>

<svelte:window onkeydown={key} />

<div class="overlay-backdrop" role="presentation" onclick={(e) => e.target === e.currentTarget && performance.now() - openedAt > 450 && onClose()}>
  <div class="journal glass-dark" role="dialog" aria-modal="true" aria-labelledby="j-title">
    <header>
      <h2 id="j-title" class="pixel">Diario de {config.ella}</h2>
      <button class="icon-btn" bind:this={closeBtn} onclick={onClose} aria-label="Cerrar diario">✕</button>
    </header>
    <div class="tabs" role="tablist">
      <button role="tab" aria-selected={tab === 'recuerdos'} class:on={tab === 'recuerdos'} onclick={() => { tab = 'recuerdos'; open = null; }}>Recuerdos <b>{unlocked}/{items.length}</b></button>
      <button role="tab" aria-selected={tab === 'mensajes'} class:on={tab === 'mensajes'} onclick={() => { tab = 'mensajes'; open = null; }}>Mensajes <b>{msgs.length}</b></button>
    </div>

    <div class="body scroll">
      {#if tab === 'recuerdos'}
        {#if open}
          <article class="detail {open.kind}">
            <button class="btn small ghost back" onclick={() => (open = null)}>‹ Volver</button>
            {#if open.kind === 'foto'}
              <div class="polaroid"><Photo src={open.photo} alt={open.title} seed={open.id.length * 7} />{#if open.date}<p class="pixel date">{open.date}</p>{/if}</div>
            {:else if open.kind === 'dibujo' && scene}
              <img class="scene" src={scene} alt="Los dos bajo nuestro árbol" />
            {/if}
            <p class="kind pixel">{icon[open.kind]} {kindName[open.kind]}</p>
            <h3 class="pixel">{open.title}</h3>
            <p class="text">{open.text}</p>
          </article>
        {:else}
          <div class="bar" aria-hidden="true"><span style="width:{(unlocked / items.length) * 100}%"></span></div>
          <ul class="grid">
            {#each items as it}
              {@const got = !!progress.found[it.id]}
              <li>
                <button class="card {it.kind}" class:locked={!got} onclick={() => select(it)} aria-label={got ? `${kindName[it.kind]}: ${it.title}` : 'Recuerdo sin descubrir'} aria-disabled={!got}>
                  <span class="ic" aria-hidden="true">{got ? icon[it.kind] : '?'}</span>
                  <span class="t">{got ? it.title : '· · ·'}</span>
                  <span class="k pixel">{got ? kindName[it.kind] : 'Por descubrir'}</span>
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      {:else}
        {#if msgs.length === 0}
          <p class="empty">Aún no hay mensajes. Abre la app otro día ✦</p>
        {:else}
          <ol class="msgs">
            {#each msgs as m}
              <li><span class="n pixel">Nº {m.number}</span><p>{m.text}</p></li>
            {/each}
          </ol>
        {/if}
      {/if}
    </div>
  </div>
</div>

<style>
  .journal {
    width: min(760px, 100%); height: min(640px, 100%);
    display: flex; flex-direction: column; padding: 18px 18px 0;
    animation: book 0.5s cubic-bezier(.2,.9,.3,1.1) both;
  }
  header { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
  h2 { margin: 0; font-size: 1.5rem; font-weight: 600; }
  .tabs { display: flex; gap: 8px; margin: 14px 0 10px; }
  .tabs button {
    appearance: none; flex: 1; min-height: 44px; cursor: pointer;
    border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.06); font-family: var(--f-pixel); font-size: 1rem;
  }
  .tabs button.on { background: rgba(255, 179, 199, 0.25); border-color: rgba(255, 179, 199, 0.6); }
  .tabs b { font-weight: 400; color: var(--acento); margin-left: 4px; }
  .body { flex: 1; padding-bottom: 18px; margin: 0 -6px; padding-left: 6px; padding-right: 6px; }
  .bar { height: 8px; background: rgba(255, 255, 255, 0.12); border-radius: 8px; overflow: hidden; margin-bottom: 14px; }
  .bar span { display: block; height: 100%; background: linear-gradient(90deg, var(--acento), var(--luz)); transition: width 0.6s; }
  .grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 12px; }
  .card {
    appearance: none; width: 100%; min-height: 130px; cursor: pointer; text-align: left;
    display: flex; flex-direction: column; gap: 6px; padding: 14px;
    border-radius: 16px; border: 1px solid rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.1);
    transition: transform 0.2s;
  }
  .card:hover:not(.locked) { transform: translateY(-3px) rotate(-1deg); }
  .card .ic { font-size: 1.6rem; line-height: 1; }
  .card .t { font-weight: 800; line-height: 1.25; flex: 1; }
  .card .k { font-size: 0.8rem; opacity: 0.75; }
  .card.nota:not(.locked) { background: linear-gradient(180deg, #fff8ef, #fbe9d8); color: var(--tinta); rotate: -1deg; }
  .card.foto:not(.locked) { background: #fff8ef; color: var(--tinta); border: 6px solid #fff8ef; box-shadow: inset 0 -26px 0 #f1e3d0; rotate: 1deg; }
  .card.estrella:not(.locked) { background: radial-gradient(circle at 30% 20%, rgba(255, 217, 138, 0.35), transparent 60%), linear-gradient(160deg, #2b2160, #1b1638); color: var(--luz); }
  .card.insignia:not(.locked) { background: linear-gradient(160deg, rgba(160, 240, 170, 0.3), rgba(60, 140, 90, 0.3)); }
  .card.dibujo:not(.locked) { background: linear-gradient(160deg, rgba(240, 147, 184, 0.4), rgba(122, 69, 150, 0.4)); }
  .card.carta:not(.locked) { background: linear-gradient(160deg, #ffc4d4, #ff8fb1); color: #3a1430; }
  .card.locked { cursor: default; opacity: 0.55; border-style: dashed; background: rgba(255, 255, 255, 0.04); }
  .detail { text-align: center; padding: 6px 4px 10px; animation: book 0.4s ease both; }
  .back { float: left; }
  .detail h3 { margin: 4px 0 10px; font-size: 1.45rem; font-weight: 600; clear: both; }
  .kind { margin: 18px 0 0; color: var(--acento); clear: both; }
  .text { margin: 0 auto; max-width: 46ch; white-space: pre-line; font-size: 1.08rem; }
  .polaroid { clear: both; width: min(280px, 80%); margin: 50px auto 0; background: #fff8ef; padding: 10px 10px 12px; rotate: -2deg; border-radius: 6px; }
  .date { margin: 8px 0 0; color: #7a4596; }
  .scene { clear: both; display: block; width: min(320px, 85%); margin: 50px auto 0; image-rendering: pixelated; border-radius: 10px; box-shadow: 0 0 0 3px var(--luz); }
  .detail.nota .text { background: #fff8ef; color: var(--tinta); padding: 20px; border-radius: 12px; font-weight: 600; margin-top: 10px; }
  .detail.estrella .text { color: var(--luz); font-size: 1.25rem; font-weight: 600; }
  .msgs { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
  .msgs li { background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 14px; padding: 12px 14px; }
  .msgs .n { color: var(--acento); font-size: 0.85rem; }
  .msgs p { margin: 2px 0 0; }
  .empty { text-align: center; color: var(--texto-suave); margin-top: 40px; }
  @keyframes book { from { opacity: 0; transform: translateY(20px) scale(0.97); } to { opacity: 1; transform: none; } }
</style>
