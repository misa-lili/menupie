<script lang="ts">
  import {
    tokenPayload,
    isOwner,
    isOpen,
    isEditable,
    eventBus,
  } from "$lib/store"
  import {
    PUBLIC_WEB_GOOGLE_CLIENT_ID,
    PUBLIC_WEB_GOOGLE_REDIRECT_PATH,
  } from "$env/static/public"

  function triggerSave() {
    eventBus.trigger("save", {})
  }

  function triggerOpenRightSheet(event) {
    eventBus.trigger("openRightSheet", { event })
  }

  function toggleEditable() {
    $isEditable = !$isEditable
    if ($isEditable === false) {
      eventBus.trigger("rollback", {})
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
    {#if $isOwner}
      <button
        class:hidden={!$tokenPayload.email || !$isOwner}
        class="icon text-4xl"
        on:click={toggleEditable}
      >
        {$isEditable ? "⏎" : "🏗️"}
      </button>
    {/if}
    {#if $isEditable}
      <button
        class:hidden={!$tokenPayload.email || !$isOwner}
        class="icon text-4xl"
        on:click={triggerSave}
      >
        💾
      </button>
    {/if}
  </div>

  <div class="flex gap-5">
    {#if !$tokenPayload.email}
      <button class:hidden={$isOpen} on:click={login} class="icon text-4xl">
        <img
          class="grayscale opacity-50"
          src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"
        />
      </button>
    {:else}
      <button
        class:hidden={$isOpen}
        on:click={triggerOpenRightSheet}
        class="icon"
      >
        <img src={$tokenPayload.picture} alt={$tokenPayload.name} />
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
