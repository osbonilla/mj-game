<script>
  // Cruceta táctil de cristal + botón de acción. (También se puede tocar el suelo para caminar.)
  let { engine, near, verb } = $props();
  let pad;
  let active = $state(null);
  let pid = null;
  let lastPress = 0;
  // un toque puede generar pointerdown + touchstart + click: solo cuenta uno
  function press() {
    const now = performance.now();
    if (now - lastPress < 350) return;
    lastPress = now;
    engine?.interact();
  }

  function setDir(dx, dy) {
    const dist = Math.hypot(dx, dy);
    const dirs = { up: false, down: false, left: false, right: false };
    if (dist > 10) {
      const a = Math.atan2(dy, dx); // 8 direcciones
      const oct = Math.round(a / (Math.PI / 4));
      if (oct === 0) dirs.right = true;
      else if (oct === 1) { dirs.right = dirs.down = true; }
      else if (oct === 2) dirs.down = true;
      else if (oct === 3) { dirs.left = dirs.down = true; }
      else if (Math.abs(oct) === 4) dirs.left = true;
      else if (oct === -3) { dirs.left = dirs.up = true; }
      else if (oct === -2) dirs.up = true;
      else if (oct === -1) { dirs.right = dirs.up = true; }
    }
    for (const k in dirs) engine?.setKey(k, dirs[k]);
    active = Object.keys(dirs).filter((k) => dirs[k]).join(' ');
  }
  function down(e) {
    e.preventDefault();
    pid = e.pointerId;
    try { pad.setPointerCapture?.(e.pointerId); } catch {}
    move(e);
  }
  function move(e) {
    if (pid !== e.pointerId) return;
    const r = pad.getBoundingClientRect();
    setDir(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
  }
  function up(e) {
    if (pid !== e.pointerId) return;
    pid = null;
    setDir(0, 0);
  }
</script>

<div class="controls">
  <div
    class="pad glass-dark"
    bind:this={pad}
    onpointerdown={down}
    onpointermove={move}
    onpointerup={up}
    onpointercancel={up}
    role="group"
    aria-label="Cruceta de movimiento"
  >
    {#each ['up', 'right', 'down', 'left'] as d}
      <span class="arrow {d}" class:on={active?.includes(d)} aria-hidden="true"></span>
    {/each}
    <span class="center" aria-hidden="true"></span>
  </div>

  <div class="action-wrap">
    {#if near}<span class="verb pixel">{verb}</span>{/if}
    <button
      class="action"
      class:ready={!!near}
      onpointerdown={(e) => { e.preventDefault(); press(); }}
      ontouchstart={(e) => { e.preventDefault(); press(); }}
      onclick={press}
      aria-label={near ? verb : 'Interactuar'}
    >
      <span class="pixel">A</span>
    </button>
  </div>
</div>

<style>
  .controls {
    position: absolute; z-index: 12; left: 0; right: 0;
    bottom: calc(18px + var(--safe-b));
    padding: 0 calc(18px + var(--safe-r)) 0 calc(18px + var(--safe-l));
    display: flex; justify-content: space-between; align-items: flex-end;
    pointer-events: none;
  }
  .pad {
    pointer-events: auto; position: relative;
    width: 132px; height: 132px; border-radius: 50%;
    touch-action: none; opacity: 0.88;
  }
  .arrow { position: absolute; width: 0; height: 0; border: 11px solid transparent; opacity: 0.75; transition: opacity 0.1s, transform 0.1s; }
  .arrow.up { left: 50%; top: 14px; translate: -50% 0; border-bottom: 14px solid #fff8ef; border-top: 0; }
  .arrow.down { left: 50%; bottom: 14px; translate: -50% 0; border-top: 14px solid #fff8ef; border-bottom: 0; }
  .arrow.left { top: 50%; left: 14px; translate: 0 -50%; border-right: 14px solid #fff8ef; border-left: 0; }
  .arrow.right { top: 50%; right: 14px; translate: 0 -50%; border-left: 14px solid #fff8ef; border-right: 0; }
  .arrow.on { opacity: 1; filter: drop-shadow(0 0 6px var(--acento)); transform: scale(1.15); }
  .center { position: absolute; left: 50%; top: 50%; width: 38px; height: 38px; translate: -50% -50%; border-radius: 50%; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.3); }
  .action-wrap { display: flex; flex-direction: column; align-items: center; gap: 8px; pointer-events: auto; }
  .verb { font-size: 0.85rem; background: rgba(27, 22, 56, 0.7); padding: 3px 10px; border-radius: 10px; animation: in 0.2s ease both; }
  .action {
    appearance: none; width: 80px; height: 80px; border-radius: 50%;
    border: 1px solid rgba(255, 255, 255, 0.4);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.08));
    -webkit-backdrop-filter: var(--blur); backdrop-filter: var(--blur);
    box-shadow: var(--glass-shadow);
    font-size: 1.6rem; color: var(--texto);
    touch-action: none; transition: all 0.25s;
  }
  .action.ready {
    background: linear-gradient(180deg, rgba(255, 179, 199, 0.9), rgba(255, 127, 163, 0.75));
    color: #3a1430; border-color: #ffe0ea;
    box-shadow: 0 0 0 6px rgba(255, 179, 199, 0.25), 0 8px 26px rgba(255, 127, 163, 0.5);
    animation: ready 1.4s ease-in-out infinite;
  }
  .action:active { transform: scale(0.94); }
  @keyframes ready { 50% { box-shadow: 0 0 0 12px rgba(255, 179, 199, 0.12), 0 8px 26px rgba(255, 127, 163, 0.5); } }
  @keyframes in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
</style>
