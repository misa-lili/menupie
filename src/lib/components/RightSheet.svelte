<script lang="ts">
  import { goto } from "$app/navigation"
  import { onMount } from "svelte"

  export let tokenPayload = {}
  export let menuKeys = []

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
    console.log(response)
  }
</script>

<sheet>
  <section id="name">
    <h1>👋, 🧾🥧!</h1>
  </section>
  {#if tokenPayload.email}
    <img src={tokenPayload.picture} alt={tokenPayload.name} />
    <div>
      <button on:click={logout}>Logout</button>
    </div>
  {:else}
    <form method="post" action="?/auth">
      <button type="submit" value="Login with Google">Login with Google</button>
    </form>
  {/if}

  <gap />

  <section id="menu-list">
    {#each menuKeys as menuKey}
      <div>
        <a href={`#${menuKey}`}>{menuKey}</a>
      </div>
    {/each}
  </section>

  <gap />
  <section id="create-menu">
    <button on:click={createMenu}>create menu</button>
  </section>

  <gap />

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

  <gap />

  {#if tokenPayload.isAdmin === true}
    <h3>admin panel</h3>
    <button
      on:click={() => {
        fetch("/api/v1/initTables")
      }}>init tables</button
    >
  {/if}
</sheet>

<style>
  sheet {
    position: fixed;
    width: 300px;
    height: 100%;
    right: 0px;
    margin: 0px;
    padding: 1rem 2rem;
    border-left: 1px solid #000;
  }

  gap {
    display: block;
    padding: 1rem 0rem;
  }
</style>
