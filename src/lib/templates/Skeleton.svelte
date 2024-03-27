<script lang="ts">
  import { onMount } from "svelte"
  import { store_menu } from "$lib/store"
</script>

<main>
  <section id="title">
    <h1>
      {@html $store_menu.data.title?.value || "새로운 타이틀"}
    </h1>
  </section>

  <section id="headers">
    {#each $store_menu.data.headers || [] as header}
      <div>
        {@html header.value}
      </div>
    {/each}
  </section>

  <section id="groups">
    {#each $store_menu.data.groups || [] as group}
      <div class="group">
        <h2>
          {group.name || ""}
          {group.col || ""}
        </h2>
        {#each group.items || [] as item}
          <div class="item">
            <div class="between">
              <h3>
                {item.name}
              </h3>
              <div>
                {item.price}
              </div>
            </div>
            <div>
              {item.description}
            </div>
          </div>
        {/each}
      </div>
    {/each}
  </section>

  <section id="footers"></section>
</main>

<style>
  main {
    @apply container mx-auto mt-16 mb-24 px-6 w-full sm:w-4/5 md:w-3/4 lg:w-2/3 xl:w-[40%];
  }

  section {
    @apply mb-8;
  }

  h1 {
    @apply text-4xl font-bold mb-4;
  }

  h2 {
    @apply text-3xl font-bold mb-3;
  }

  h3 {
    @apply text-2xl font-bold mb-2;
  }

  p {
    @apply mb-4 leading-relaxed;
  }

  ul {
    @apply list-disc list-inside mb-4;
  }

  ol {
    @apply list-decimal list-inside mb-4;
  }

  li {
    @apply mb-2;
  }

  blockquote {
    @apply border-l-4 border-gray-300 pl-4 italic mb-4;
  }

  code {
    @apply bg-gray-100 text-gray-800 px-2 py-1 rounded;
  }

  pre {
    @apply bg-gray-100 p-4 mb-4 overflow-x-auto;
  }

  a {
    @apply text-blue-500 underline;
  }

  img {
    @apply max-w-full h-auto mb-4;
  }

  div.group {
    @apply mb-24;
  }

  div.item {
    @apply mb-8;
  }

  div.between {
    @apply flex justify-between;
  }
</style>
