<script lang="ts">
  import Editor from "$lib/templates/Editor.svelte"
  import Skeleton from "$lib/templates/Skeleton.svelte"
  import Dosisool from "$lib/templates/Dosisool.svelte"
  import {
    menu,
    menus,
    tokenPayload,
    isOwner,
    isAdmin,
    eventBus,
  } from "$lib/store"

  export let data: {
    menu: Menu
    menus: MenuHandle[]
    tokenPayload: TokenPayload
    isOwner: boolean
    isAdmin: boolean
  }

  $: if (data) {
    $menu = data.menu
    $menus = data.menus
    $tokenPayload = data.tokenPayload
    $isOwner = data.isOwner
    $isAdmin = data.isAdmin
  }
</script>

<Editor></Editor>
