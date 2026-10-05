<script>
  import { config } from './config.js';
  import { progress, ui, save, resetProgress } from './lib/game/state.svelte.js';
  import { messageForThisOpen } from './lib/game/daily.js';
  import { initAudio, setSound, sfx } from './lib/game/audio.js';
  import MainMenu from './lib/components/MainMenu.svelte';
  import Intro from './lib/components/Intro.svelte';
  import GameWorld from './lib/components/GameWorld.svelte';

  const daily = messageForThisOpen();
  let iris = $state('idle'); // idle | closing | opening
  let worldKey = $state(0);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Colores principales desde la configuración
  const root = document.documentElement.style;
  root.setProperty('--acento', config.colores.acento);
  root.setProperty('--luz', config.colores.luz);
  root.setProperty('--noche', config.colores.noche);
  root.setProperty('--texto', config.colores.texto);
  document.title = config.title;

  // Transición cinematográfica tipo "iris" de los juegos clásicos
  function goTo(scene) {
    if (iris !== 'idle') return;
    if (reduced) { ui.scene = scene; return; }
    iris = 'closing';
    setTimeout(() => {
      ui.scene = scene;
      iris = 'opening';
      setTimeout(() => (iris = 'idle'), 900);
    }, 850);
  }

  function start() {
    initAudio();
    setSound(progress.sound);
    sfx.select();
    progress.started = true;
    save();
    goTo(progress.introSeen ? 'world' : 'intro');
  }
  function introDone() {
    progress.introSeen = true;
    save();
    goTo('world');
  }
  function reset() {
    resetProgress();
    worldKey++;
    goTo('menu');
  }
</script>

<main>
  {#if ui.scene === 'menu'}
    <MainMenu {daily} onStart={start} />
  {:else if ui.scene === 'intro'}
    <Intro onDone={introDone} />
  {:else if ui.scene === 'world'}
    {#key worldKey}
      <GameWorld {daily} onMenu={() => goTo('menu')} onReset={reset} />
    {/key}
  {/if}

  {#if iris !== 'idle'}
    <div class="iris {iris}" aria-hidden="true"><div class="hole"></div></div>
  {/if}
</main>

<style>
  .iris { position: fixed; inset: 0; z-index: 100; pointer-events: all; display: grid; place-items: center; overflow: hidden; }
  .hole {
    width: 0; height: 0; border-radius: 50%;
    box-shadow: 0 0 0 200vmax #0b0820;
  }
  .closing .hole { animation: close 0.85s cubic-bezier(.6,0,.4,1) both; }
  .opening .hole { animation: close 0.9s cubic-bezier(.6,0,.4,1) reverse both; }
  @keyframes close {
    from { width: 160vmax; height: 160vmax; }
    to { width: 0; height: 0; }
  }
</style>
