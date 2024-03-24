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

  $menu = data.menu
  $menus = data.menus
  $tokenPayload = data.tokenPayload
  $isOwner = data.isOwner
  $isAdmin = data.isAdmin

  const template = {
    Editor,
    Skeleton,
    Dosisool,
  }

  let currentTemplate = data.menu.data.template || "Skeleton"

  async function saveTemplate() {
    const response = await fetch(`/api/v1/menus/${data.menu.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...data.menu.data, template: currentTemplate }),
    })

    if (response.ok) {
      alert("템플릿이 변경되었습니다.")
    } else {
      alert("템플릿 변경이 실패했습니다.")
    }
  }
</script>

<Editor></Editor>
