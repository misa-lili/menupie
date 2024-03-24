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
    if (!confirm("정말 로그아웃하시겠습니까?")) return

    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    await goto("/", { replaceState: true })
    window.location.reload()
  }

  async function createMenu() {
    const newKey = prompt("Enter new menu key")
    if (!newKey) return

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
    <div>
      <h2 class="pl-1.5 pb-0.5 text-slate-600">메뉴들</h2>
      <ul>
        {#each $menus as menuHandle (menuHandle.id)}
          <li class="cursor-pointer" on:click={gotoMenu(menuHandle.key)}>
            <span>{menuHandle.key}</span>
            <button
              class="cursor-pointer"
              on:click|stopPropagation={deleteMenu(menuHandle.id)}>🗑️</button
            >
          </li>
        {/each}
      </ul>
    </div>
  {/if}
  <button class="button-text" on:click={createMenu}>➕</button>

  <section id="create-menu"></section>

  <section id="logout">
    <button class="button-text" on:click={logout}>
      <span>👋</span>
    </button>
  </section>
</sheet>

<style>
  sheet {
    @apply fixed top-0 w-[300px] h-full shadow-2xl m-0 py-12 px-8;
    @apply transition-all text-black h-full rounded-tl-3xl bg-slate-100;
  }

  section {
    @apply mb-12;
  }

  ul {
    @apply mb-2 bg-slate-200 rounded-lg shadow-sm;
  }

  ul li {
    @apply py-3 px-6 flex justify-between items-center;
    @apply text-lg font-mono;
  }

  ul li:first-child {
    @apply hover:bg-slate-100/50 rounded-t-lg;
  }

  ul li:not(:first-child):not(:last-child) {
    @apply hover:bg-slate-100/50;
  }

  ul li:last-child {
    @apply hover:bg-slate-100/50 rounded-b-lg;
  }

  ul li:not(:last-child) {
    @apply border-b border-slate-300;
  }

  .button-text {
    @apply w-full py-3 px-6 rounded-lg bg-slate-200 text-slate-800 shadow-sm;
    @apply hover:bg-slate-200;
    @apply text-lg tracking-wider font-mono;
  }
</style>
