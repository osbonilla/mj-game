<script>
  // Foto con plan B: si el archivo no existe, muestra una ilustración pixel art.
  import { onMount } from 'svelte';
  import { sceneDataURL } from '../game/illustration.js';
  let { src = '', alt = '', seed = 1 } = $props();
  let failed = $state(false);
  let fallback = $state('');
  const toUrl = (s) => (!s ? '' : /^(https?:|data:)/.test(s) ? s : import.meta.env.BASE_URL + s.replace(/^\//, ''));
  let url = $derived(toUrl(src));
  onMount(() => { fallback = sceneDataURL(96, 72, { seed }); });
</script>

<div class="photo">
  {#if url && !failed}
    <img src={url} {alt} onerror={() => (failed = true)} />
  {:else if fallback}
    <img class="px" src={fallback} alt={alt ? `${alt} (ilustración)` : 'Ilustración'} />
  {/if}
</div>

<style>
  .photo { position: relative; width: 100%; aspect-ratio: 4 / 3; background: #2b2160; overflow: hidden; border-radius: 4px; }
  img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .px { image-rendering: pixelated; }
  .note {
    position: absolute; left: 6px; right: 6px; bottom: 6px;
    font-size: 0.68rem; line-height: 1.2; color: #fff8ef; background: rgba(27, 22, 56, 0.6);
    padding: 3px 6px; border-radius: 6px; text-align: center;
  }
</style>
