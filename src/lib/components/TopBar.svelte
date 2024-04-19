<script lang="ts">
  import {
    store_tokenPayload,
    store_isOwner,
    store_isOpen,
    store_isEditable,
    store_eventBus,
    store_menu,
  } from "$lib/store"
  import {
    PUBLIC_MAIN_KEY,
    PUBLIC_WEB_GOOGLE_CLIENT_ID,
    PUBLIC_WEB_GOOGLE_REDIRECT_PATH,
  } from "$env/static/public"
  import { goto } from "$app/navigation"
  import { page } from "$app/stores"

  function triggerSave() {
    store_eventBus.trigger("save", {})
  }

  function triggerOpenRightSheet(event) {
    store_eventBus.trigger("openRightSheet", { event })
  }

  function triggerChangeTemplate(event) {
    store_eventBus.trigger("changeTemplate", { template: event.target.value })
  }

  function toggleEditable() {
    if ($store_isEditable === false) {
      $store_isEditable = !$store_isEditable
    } else if ($store_isEditable === true) {
      store_eventBus.trigger("rollback", {})
    }
  }

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
</script>

<div id="top-bar">
  <div class="flex gap-5">
    {#if $store_isOwner}
      <button
        class:hidden={!$store_tokenPayload.email || !$store_isOwner}
        class="icon text-4xl"
        on:click={toggleEditable}
      >
        {$store_isEditable ? "⏎" : "🏗️"}
      </button>
    {/if}
    {#if $store_isEditable}
      <select
        bind:value={$store_menu.data.template}
        on:change={(event) => triggerChangeTemplate(event)}
      >
        <option value="default">기본</option>
        <option value="dosisool">도시술</option>
      </select>

      <button
        class:hidden={!$store_tokenPayload.email || !$store_isOwner}
        class="icon text-4xl"
        on:click={triggerSave}
      >
        💾
      </button>
    {/if}
  </div>

  <div class="flex gap-5">
    {#if !$store_tokenPayload.email && $page.params.key === PUBLIC_MAIN_KEY}
      <button
        class:hidden={$store_isOpen}
        on:click={login}
        class="icon text-4xl"
      >
        <img
          class="grayscale opacity-50"
          src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
        />
      </button>
    {:else if $store_tokenPayload.email}
      <button
        class:hidden={$store_isOpen}
        on:click={triggerOpenRightSheet}
        class="icon"
      >
        <img src={$store_tokenPayload.picture} alt={$store_tokenPayload.name} />
      </button>
    {/if}
  </div>
</div>

<style>
  div#top-bar {
    @apply sticky top-0 mt-6 w-full h-16 px-6 flex items-center justify-between;
  }

  button.icon {
    @apply h-10 w-10 rounded-full overflow-hidden shadow-2xl flex justify-center items-center;
    @apply border;
  }
</style>
