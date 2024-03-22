<script lang="ts">
  import "../app.css"
  import RightSheet from "$lib/components/RightSheet.svelte"
</script>

<RightSheet></RightSheet>

<slot />

<style>
  :global(icon) {
    @apply flex items-center justify-center w-9 h-9;
    @apply rounded-full overflow-hidden;
  }
</style>
