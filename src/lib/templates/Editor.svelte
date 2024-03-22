<script lang="ts">
  import { onMount, tick } from "svelte"
  import { menu as storeMenu, tokenPayload } from "$lib/store"
  import { get } from "svelte/store"

  let menu = JSON.parse(JSON.stringify(get(storeMenu)))
  let focused = {
    id: "",
    arr: [],
    idx: 0,
  }

  onMount(() => {
    addSaveShortcut()
  })

  async function addSaveShortcut() {
    window.addEventListener("keydown", async (e) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        await save()
      }
    })
  }

  function setIdBeforeSave(data: MenuData): MenuData {
    data.title.id = data.title.id ?? crypto.randomUUID()

    data.headers = data.headers.map((header) => {
      if (!header.id) {
        header.id = crypto.randomUUID()
      }
      return header
    })

    data.groups = data.groups.map((group) => {
      if (!group.id) {
        group.id = crypto.randomUUID()
      }
      group.items = group.items.map((item) => {
        if (!item.id) {
          item.id = crypto.randomUUID()
        }
        return item
      })
      return group
    })

    data.footers = data.footers.map((footer) => {
      if (!footer.id) {
        footer.id = crypto.randomUUID()
      }
      return footer
    })

    return data
  }

  export async function save() {
    if (!$tokenPayload.email) {
      return
    }

    const data = menu.data

    const response = await fetch(`/api/v1/menus/${menu.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(setIdBeforeSave(data)),
    })

    if (response.ok) {
      alert("저장되었습니다.")
    } else {
      alert("저장에 실패했습니다.")
    }
  }

  function insertHeader() {
    menu.data.headers = menu.data.headers || []
    menu.data.headers.push({ id: crypto.randomUUID(), value: "새로운 헤더" })
  }

  function insertGroup() {
    menu.data.groups = menu.data.groups || []
    menu.data.groups.push({
      id: crypto.randomUUID(),
      name: "새로운 그룹",
      col: "새로운 컬럼",
      items: [],
    })
  }

  function insertItem(group) {
    group.items = group.items || []
    group.items.push({
      id: crypto.randomUUID(),
      name: "새로운 아이템",
      price: "0",
      description: "새로운 설명",
      out: false,
    })
    menu = menu
  }

  function insertFooter() {
    menu.data.footers = menu.data.footers || []
    menu.data.footers.push({ id: crypto.randomUUID(), value: "새로운 푸터" })
  }

  function focus(arr: any[], idx: number, id: string) {
    focused.arr = arr
    focused.idx = idx
    focused.id = id

    setToolbox(id)
  }

  function setToolbox(id) {
    const target = document.getElementById(id)
    let toolbox = document.getElementById("toolbox")
    toolbox.style.display = "block"
    toolbox.style.position = "absolute"
    const scrollY = window.scrollY || window.pageYOffset
    toolbox.style.top = `${target.getBoundingClientRect().top - toolbox.offsetHeight + scrollY - 10}px`
    toolbox.style.left = `${target.getBoundingClientRect().left}px`
  }

  function blur() {
    // remove float div toolbox
    let toolbox = document.getElementById("toolbox")
    toolbox.style.display = "none"
  }

  function flyTo(id) {
    const target = document.getElementById(id)
    const scrollY = window.scrollY || window.pageYOffset
    target?.scrollIntoView({
      block: "center",
      behavior: "smooth",
    })
  }

  async function move(delta: -1 | 1) {
    if (
      (delta === -1 && focused.idx > 0) ||
      (delta === 1 && focused.idx < focused.arr.length - 1)
    ) {
      const temp = focused.arr[focused.idx]
      focused.arr[focused.idx] = focused.arr[focused.idx + delta]
      focused.arr[focused.idx + delta] = temp
      focused.idx = focused.idx + delta
      menu = menu
      await tick()
      setToolbox(focused.id)
      flyTo(focused.id)
    }
  }

  function toggleOut() {
    focused.arr[focused.idx].out = !focused.arr[focused.idx].out
    menu = menu
  }

  function deleteFocused() {
    focused.arr.splice(focused.idx, 1)
    menu = menu
  }

  // <img> 태그를 텍스트로 변환
  function convertImgToText(imgTag: string) {
    return String(imgTag).replaceAll(/</g, "&lt;").replaceAll(/>/g, "&gt;")
  }

  // 텍스트를 <img> 태그로 변환
  function convertTextToImg(text: string) {
    return String(text).replaceAll(/&lt;/g, "<").replaceAll(/&gt;/g, ">")
  }

  function toggleHTML() {
    const target = focused.arr[focused.idx]
    const prop = target.value ? "value" : "name"
    if (target[prop].includes("<")) {
      target[prop] = convertImgToText(target[prop])
    } else {
      target[prop] = convertTextToImg(target[prop])
    }
    menu = menu
  }
</script>

<div
  class:hidden={!$tokenPayload.email}
  class="fixed z-50 bottom-0 left-1/2 -translate-x-1/2 pb-3"
>
  <button on:click={save}>저장</button>
</div>

<div id="toolbox" class="hidden">
  <button on:mousedown|preventDefault={() => move(-1)}>🔼</button>
  <button on:mousedown|preventDefault={() => move(1)}>🔽</button>
  <button on:mousedown|preventDefault={toggleOut}>⛔️</button>
  <button on:mousedown|preventDefault={toggleHTML}>🖼️</button>
  <button on:mousedown|preventDefault={deleteFocused}>🗑️</button>
</div>

<main>
  <section id="title">
    <h1 contenteditable="true" bind:innerHTML={menu.data.title.value} />
  </section>

  <section id="headers">
    {#each menu.data.headers || [] as header, idx (header.id)}
      <div
        class:out-of-stock={header.out}
        contenteditable="true"
        bind:innerHTML={header.value}
        id={header.id}
        on:focus={() => focus(menu.data.headers, idx, header.id)}
        on:blur={blur}
      />
    {/each}
    <button on:click={insertHeader}>헤더추가</button>
  </section>

  <section id="groups">
    {#each menu.data.groups || [] as group, idx (group.id)}
      <div class="group">
        <div class="between">
          <h2
            class:out-of-stock={group.out}
            contenteditable="true"
            bind:innerHTML={group.name}
            id={group.id}
            on:focus={() => focus(menu.data.groups, idx, group.id)}
            on:blur={blur}
          />
          <span contenteditable="true" bind:innerHTML={group.col} />
        </div>
        {#each group.items || [] as item, idx (item.id)}
          <div class="item">
            <div class="between">
              <h3
                class:out-of-stock={item.out}
                contenteditable="true"
                bind:innerHTML={item.name}
                id={item.id}
                on:focus={() => focus(group.items, idx, item.id)}
                on:blur={blur}
              />
              <div contenteditable="true" bind:innerHTML={item.price} />
            </div>
            <div contenteditable="true" bind:innerHTML={item.description} />
          </div>
        {/each}
        <button on:click={() => insertItem(group)}>아이템추가</button>
      </div>
    {/each}
    <button on:click={insertGroup}>그룹추가</button>
  </section>

  <section id="footers">
    {#each menu.data.footers || [] as footer, idx (footer.id)}
      <div
        class:out-of-stock={footer.out}
        contenteditable="true"
        bind:innerHTML={footer.value}
        id={footer.id}
        on:focus={() => focus(menu.data.footers, idx, footer.id)}
        on:blur={blur}
      />
    {/each}
    <button on:click={insertFooter}>푸터추가</button>
  </section>
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

  button {
    @apply mt-6;
    @apply text-xs border rounded-2xl px-1.5 py-0.5 bg-slate-100 text-slate-500;
  }

  .out-of-stock {
    @apply line-through opacity-40;
  }
</style>
