<script lang="ts">
  import { goto } from "$app/navigation"
  import RightSheet from "$lib/components/RightSheet.svelte"
  import { onMount } from "svelte"

  export let data

  async function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    await goto("/", { replaceState: true })
    window.location.reload()
  }
</script>

<RightSheet tokenPayload={data.tokenPayload} menuKeys={data.menuKeys} />
