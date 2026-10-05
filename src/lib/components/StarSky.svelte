<script>
  // Cielo nocturno pixelado con estrellas que titilan y alguna estrella fugaz.
  import { onMount } from 'svelte';
  let { density = 1, warm = false } = $props();
  let canvas;

  onMount(() => {
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    let w, h, stars = [], shoot = null, raf, t = 0;
    const S = 3; // tamaño de pixel
    function resize() {
      w = Math.ceil(innerWidth / S);
      h = Math.ceil(innerHeight / S);
      canvas.width = w;
      canvas.height = h;
      stars = Array.from({ length: Math.round(((w * h) / 140) * density) }, () => ({
        x: Math.random() * w, y: Math.random() * h, p: Math.random() * 6, s: Math.random() < 0.08 ? 2 : 1,
        c: Math.random() < 0.15 ? '#ffd98a' : Math.random() < 0.2 ? '#ffc6dc' : '#fff8ef',
      }));
    }
    resize();
    addEventListener('resize', resize);
    let mx = 0, my = 0;
    const onMove = (e) => { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; };
    addEventListener('pointermove', onMove);
    const frame = () => {
      t += 0.016;
      ctx.clearRect(0, 0, w, h);
      for (const s of stars) {
        const a = reduced ? 0.8 : 0.35 + Math.abs(Math.sin(t * 1.2 + s.p)) * 0.65;
        ctx.globalAlpha = a;
        ctx.fillStyle = s.c;
        const ox = Math.round(mx * 6 * s.s), oy = Math.round(my * 6 * s.s);
        ctx.fillRect(Math.round(s.x) + ox, Math.round(s.y) + oy, 1, 1);
        if (s.s === 2 && a > 0.8) {
          ctx.globalAlpha = a * 0.5;
          ctx.fillRect(Math.round(s.x) - 1 + ox, Math.round(s.y) + oy, 3, 1);
          ctx.fillRect(Math.round(s.x) + ox, Math.round(s.y) - 1 + oy, 1, 3);
        }
      }
      ctx.globalAlpha = 1;
      if (!reduced) {
        if (!shoot && Math.random() < 0.004) shoot = { x: Math.random() * w * 0.7 + w * 0.2, y: Math.random() * h * 0.3, l: 0 };
        if (shoot) {
          shoot.l += 1.4;
          for (let i = 0; i < 10; i++) {
            ctx.globalAlpha = 1 - i / 10;
            ctx.fillStyle = '#fff8ef';
            ctx.fillRect(Math.round(shoot.x - shoot.l + i), Math.round(shoot.y + shoot.l * 0.5 - i * 0.5), 1, 1);
          }
          ctx.globalAlpha = 1;
          if (shoot.l > 60) shoot = null;
        }
      }
      raf = requestAnimationFrame(frame);
    };
    frame();
    return () => { cancelAnimationFrame(raf); removeEventListener('resize', resize); removeEventListener('pointermove', onMove); };
  });
</script>

<div class="sky" class:warm aria-hidden="true">
  <canvas bind:this={canvas}></canvas>
</div>

<style>
  .sky {
    position: absolute; inset: 0; overflow: hidden;
    background:
      radial-gradient(ellipse 80% 50% at 50% 110%, rgba(255, 127, 163, 0.35), transparent 70%),
      radial-gradient(ellipse 60% 40% at 80% 10%, rgba(120, 90, 220, 0.35), transparent 70%),
      linear-gradient(180deg, #120e2b 0%, #1b1638 40%, #2f2363 75%, #4b2f7a 100%);
  }
  .sky.warm {
    background:
      radial-gradient(ellipse 90% 60% at 50% 110%, rgba(255, 200, 140, 0.4), transparent 70%),
      linear-gradient(180deg, #120e2b 0%, #2b2160 50%, #6b3d8a 100%);
  }
  canvas { width: 100%; height: 100%; image-rendering: pixelated; display: block; }
</style>
