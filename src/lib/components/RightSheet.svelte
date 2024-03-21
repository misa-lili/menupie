<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"
  import {
    PUBLIC_WEB_GOOGLE_CLIENT_ID,
    PUBLIC_WEB_GOOGLE_REDIRECT_URI,
  } from "$env/static/public"
  import { menus, tokenPayload } from "$lib/store"

  let isOpen = false

  async function login() {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    url.searchParams.append("client_id", PUBLIC_WEB_GOOGLE_CLIENT_ID)
    url.searchParams.append("redirect_uri", PUBLIC_WEB_GOOGLE_REDIRECT_URI)
    url.searchParams.append("response_type", "code")
    url.searchParams.append("scope", "email profile")
    url.searchParams.append("access_type", "offline")
    url.searchParams.append("prompt", "consent")

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
</script>

<span
  class:hidden={isOpen}
  class="fixed top-0 right-0"
  on:click={() => {
    isOpen = true
  }}>️⬅️</span
>
<sheet
  class:right-0={isOpen}
  class:-right-[300px]={!isOpen}
  class="transition-all"
>
  <span
    class:hidden={!isOpen}
    class="absolute left-0 top-0"
    on:click={() => {
      isOpen = false
    }}>➡️</span
  >

  <section id="login">
    {#if $tokenPayload?.email}
      <img src={$tokenPayload.picture} alt={$tokenPayload.name} />
      <div>
        👋<button on:click={logout}>Logout</button>
      </div>
    {:else}
      <button type="submit" value="Login with Google" on:click={login}>
        Login with Google
      </button>
    {/if}
  </section>

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

  {#if $tokenPayload?.email}
    <section id="create-menu">
      <button on:click={createMenu}>create menu</button>
    </section>
  {/if}

  <section id="footer">
    <div>
      <a href="https://github.com/misa-lili/qqur"
        >https://github.com/misa-lili/qqur</a
      >
    </div>
    <div>
      <a href="mailto:kyom@misalili.com?subject=[qqur]">kyom@misalili.com</a>
    </div>
  </section>

  {#if $tokenPayload.isAdmin === true}
    <h3>admin panel</h3>
    <div>
      <button
        on:click={() => {
          fetch("/api/v1/initTables")
        }}>init tables</button
      >
    </div>
    <div>
      <button
        on:click={() => {
          fetch("/api/v1/insertSamples")
        }}>insert samples</button
      >
    </div>
  {/if}
</sheet>

<style>
  sheet {
    position: fixed;
    top: 0px;
    width: 300px;
    height: 100%;
    margin: 0px;
    padding: 1rem 2rem;
    border-left: 1px solid #000;
    background-color: inherit;
  }

  section {
    @apply mb-12;
  }
</style>
