<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount, onDestroy } from "svelte"
  import { menus, tokenPayload, isAdmin, eventBus } from "$lib/store"
  import { redirect } from "@sveltejs/kit"
  import { page } from "$app/stores"
  import { get } from "svelte/store"

  let isOpen = false

  eventBus.subscribe(({ event, detail }) => {
    if (event === "openRightSheet") {
      open(detail.event)
    }
  })
  onDestroy(() => {
    eventBus.subscribe(() => {})
  })

  async function logout() {
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    await goto("/", { replaceState: true })
    window.location.reload()
  }

  async function createMenu() {
    const newKey = prompt("Enter new menu key")
    const response = await fetch("/api/v1/menus", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ key: newKey }),
    })

    if (response.ok) {
      await goto(newKey)
    }
  }

  async function deleteMenu(id) {
    if (!confirm("정말 삭제하시겠습니까?")) return

    const response = await fetch(`/api/v1/menus/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      const currentKey = get(page).params.key
      const targetKey = $menus.find((v) => v.id === id).key
      $menus = $menus.filter((menu) => menu.id !== id)
      if (currentKey === targetKey) {
        await goto("/main")
      }
    }
  }

  async function gotoMenu(key) {
    await goto(key)
  }

  function open(event?: Event) {
    if (event) event.stopPropagation()
    isOpen = true
  }

  function close() {
    isOpen = false
  }

  function clickOutside(element, callbackFunction) {
    function onClick(event) {
      if (!element.contains(event.target)) {
        callbackFunction()
      }
    }

    document.body.addEventListener("click", onClick)

    return {
      update(newCallbackFunction) {
        callbackFunction = newCallbackFunction
      },
      destroy() {
        document.body.removeEventListener("click", onClick)
      },
    }
  }
</script>

<sheet
  class:right-0={isOpen}
  class:-right-[300px]={!isOpen}
  use:clickOutside={close}
>
  {#if $menus?.length > 0}
    <section id="menu-list">
      <h2>your menu list</h2>
      {#each $menus as menuHandle (menuHandle.id)}
        <div>
          <a on:click={gotoMenu(menuHandle.key)}>{menuHandle.key}</a>
          <button on:click={deleteMenu(menuHandle.id)}>ˣ</button>
        </div>
      {/each}
    </section>
  {/if}

  <section id="create-menu">
    <button on:click={createMenu}>create menu</button>
  </section>

  <section id="logout">
    <div>
      👋<button on:click={logout}>Logout</button>
    </div>
  </section>
</sheet>

<style>
  sheet {
    @apply fixed top-0 w-[300px] h-full shadow-lg m-0 py-4 px-8;
    @apply transition-all text-black h-full rounded-l-3xl bg-slate-100;
  }

  section {
    @apply mb-12;
  }
</style>
