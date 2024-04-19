<script lang="ts">
  import RightSheet from "$lib/components/RightSheet.svelte"
  import TopBar from "$lib/components/TopBar.svelte"
</script>

<svelte:head>
  <link rel="stylesheet" type="text/css" href="/src/app.css" />
</svelte:head>

<TopBar></TopBar>

<RightSheet></RightSheet>

<slot />
