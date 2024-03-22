<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import {
    PUBLIC_WEB_GOOGLE_CLIENT_ID,
    PUBLIC_WEB_GOOGLE_REDIRECT_PATH,
  } from "$env/static/public"
  import { menus, tokenPayload, isAdmin } from "$lib/store"

  let isOpen = false

  async function login() {
    const redirectUri = window.location.origin + PUBLIC_WEB_GOOGLE_REDIRECT_PATH

    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    url.searchParams.append("client_id", PUBLIC_WEB_GOOGLE_CLIENT_ID)
    url.searchParams.append("redirect_uri", redirectUri)
    url.searchParams.append("response_type", "code")
    url.searchParams.append("scope", "email profile")
    url.searchParams.append("access_type", "offline")
    url.searchParams.append("prompt", "consent")
    url.searchParams.append("state", window.location.href)

    window.location = url.toString()
  }

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
    alert(await response.text())
  }

  async function deleteMenu(id) {
    const response = await fetch(`/api/v1/menus/${id}`, {
      method: "DELETE",
    })
    console.log(await response.text())
  }

  async function gotoMenu(key) {
    await goto(key)
    window.location.reload()
  }

  function open(event) {
    event.stopPropagation()
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

{#if !$tokenPayload.email}
  <icon
    class:hidden={isOpen}
    class="fixed top-0 right-0 cursor-pointer m-6"
    on:click={login}
  >
    <img
      class="grayscale opacity-50"
      src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
    />
  </icon>
{:else}
  <icon
    class:hidden={isOpen}
    class="fixed top-0 right-0 cursor-pointer m-6"
    on:click={open}
  >
    <img src={$tokenPayload.picture} alt={$tokenPayload.name} />
  </icon>
{/if}

<sheet
  class:right-0={isOpen}
  class:-right-[300px]={!isOpen}
  use:clickOutside={close}
>
  {#if $menus?.length > 0}
    <section id="menu-list">
      <h2>your menu list</h2>
      {#each $menus as menuHandle}
        <div>
          <button on:click={gotoMenu(menuHandle.key)}>{menuHandle.key}</button>
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
