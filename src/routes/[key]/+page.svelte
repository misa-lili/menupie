<script lang="ts">
  import { onDestroy, onMount, tick } from "svelte"
  import {
    store_menu,
    store_menus,
    store_tokenPayload,
    store_isOwner,
    store_isAdmin,
    store_eventBus,
    store_isEditable,
  } from "$lib/store"
  import { get } from "svelte/store"
  import { page } from "$app/stores"
  import { PUBLIC_MAIN_KEY, PUBLIC_STORAGE_HOST } from "$env/static/public"
  import { goto } from "$app/navigation"

  // server to client
  export let data: {
    menu: Menu
    menus: MenuHandle[]
    tokenPayload: TokenPayload
    isOwner: boolean
    isAdmin: boolean
  }

  // data to store
  $: if (data) {
    console.log(data.menu.data)
    $store_menu = data.menu
    $store_menus = data.menus
    $store_tokenPayload = data.tokenPayload
    $store_isOwner = data.isOwner
    $store_isAdmin = data.isAdmin
  }

  // 편집 가능한 상태인지
  $: isEditable =
    $page.params.key === PUBLIC_MAIN_KEY ? true : $store_isEditable

  let menu: Menu = JSON.parse(JSON.stringify(get(store_menu)))
  store_menu.subscribe((value) => {
    menu = JSON.parse(JSON.stringify(value))
  })

  let focused = {
    id: "",
    arr: [],
    idx: 0,
    type: "",
  }

  $: if (isMounted && $store_isEditable && $page.params.key) {
    setEditable()
  } else if (isMounted && !$store_isEditable && $page.params.key) {
    setUneditable()
  }

  $: if ($page.params.key && isMounted) {
    console.log("trigger when key changed and mounted")
    renderImageIterator()
  }

  let isMounted = false
  onMount(() => {
    console.log("mounted")
    isMounted = true
    addSaveShortcut()

    if ($page.params.key === PUBLIC_MAIN_KEY) {
      setEditable()
    } else {
      setUneditable()
    }
  })

  function setEditable() {
    document.querySelectorAll("[contenteditable]").forEach((element) => {
      element.setAttribute("contenteditable", "true")
    })
  }

  function setUneditable() {
    if ($page.params.key === PUBLIC_MAIN_KEY) {
      return setEditable()
    }
    document.querySelectorAll("[contenteditable]").forEach((element) => {
      element.setAttribute("contenteditable", "false")
    })
  }

  store_eventBus.subscribe(async ({ event, detail }) => {
    if (event === "save") {
      console.log("got save event")
      await save()
    }
    if (event === "rollback") {
      console.log("got rollback event")
      if (
        JSON.stringify(menu) !== JSON.stringify($store_menu) &&
        !confirm("변경사항을 되돌리시겠습니까?")
      )
        return

      $store_isEditable = !$store_isEditable
      menu = JSON.parse(JSON.stringify(get(store_menu)))
    }
    if (event === "changeTemplate") {
      console.log("got changeTemplate event")
      menu.data.template = detail.template
      await renderImageIterator()
    }
  })

  onDestroy(() => {
    store_eventBus.subscribe(() => {})
  })

  async function addSaveShortcut() {
    window.addEventListener("keydown", async (e) => {
      if (e.key === "s" && (e.metaKey || e.ctrlKey) && isEditable) {
        e.preventDefault()
        await save()
      }
      if (e.key === "Escape") {
        e.preventDefault()
        blur()
      }
    })
  }

  export async function save() {
    if (!$store_tokenPayload.email) {
      return
    }

    if (confirm("저장하시겠습니까?") === false) {
      return
    }

    // title bind
    menu.data.title.value = document.getElementById(
      menu.data.title.id,
    ).innerText
    alert(menu.data.title.value)

    const response = await fetch(`/api/v1/menus/${menu.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(menu.data),
    })

    if (response.ok) {
      $store_menu.data = menu.data
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

  function focus({
    arr,
    idx,
    id,
    type,
  }: {
    arr: any[] | undefined
    idx: number | undefined
    id: string
    type: string
  }) {
    focused.arr = arr
    focused.idx = idx
    focused.id = id
    focused.type = type

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

  async function handleUpload() {
    console.log("handleUpload")

    if (focused.type === "title" && menu.data.title.src) {
      console.log("remove title src")
      menu.data.title.src = undefined
      document.getElementById(menu.data.title.id).innerText =
        menu.data.title.value
    } else {
      console.log("upload title src")
      const input = document.getElementById("file")
      input.click()
    }
  }

  async function onChangedFileInput(e) {
    const file = e.target.files[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/v1/storage", {
          method: "POST",
          body: formData,
        })
        const result = await response.json()
        const src = result.result.Location

        if (focused.type === "title") {
          menu.data.title.src = src
        } else {
          focused.arr[focused.idx].src = src
        }

        await renderImageIterator()
      } catch (error) {
        console.error("Upload failed", error)
      }
    }
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async function renderImageIterator() {
    console.log("renderImageIterator")

    if (isMounted && menu.data.title.src) {
      await tick()
      console.log("title has src", menu.data.title.src)
      const target = document.getElementById(menu.data.title.id)
      console.log(target)
      target.innerText = ""
      target.innerHTML = `<img src="${menu.data.title.src}" alt="${menu.data.title.value}" />`
    }
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    type="text/css"
    href={`${PUBLIC_STORAGE_HOST}/templates/${menu.data.template || "default"}.css`}
  />
</svelte:head>

<input
  type="file"
  id="file"
  class="hidden"
  accept="image/png, image/jpeg, image/svg+xml"
  on:change={onChangedFileInput}
/>

<div id="toolbox" class="hidden">
  {#if focused.type === "title"}
    <button on:mousedown|preventDefault={handleUpload}>
      {menu.data.title.src ? "🔄" : "🖼️"}
    </button>
  {:else}
    <button on:mousedown|preventDefault={() => move(-1)}>🔼</button>
    <button on:mousedown|preventDefault={() => move(1)}>🔽</button>
    <button on:mousedown|preventDefault={() => {}}>🖼️</button>
    <button on:mousedown|preventDefault={toggleOut}>⛔️</button>
    <button on:mousedown|preventDefault={deleteFocused}>🗑️</button>
  {/if}
</div>

<main>
  <section>
    <h1
      id={menu.data.title.id}
      contenteditable="true"
      on:focus={() => focus({ type: "title", id: menu.data.title.id })}
      on:blur={blur}
      innerText={menu.data.title.value}
    />
  </section>

  <section id="headers">
    {#each menu.data.headers || [] as header, idx (header.id)}
      <div
        id={header.id}
        class:out-of-stock={header.out}
        contenteditable="true"
        on:focus={() =>
          focus({ type: "header", arr: menu.data.headers, idx, id: header.id })}
        on:blur={blur}
        bind:innerText={header.value}
      />
    {/each}
    <button class:hidden={!isEditable} on:click={insertHeader}>
      헤더추가
    </button>
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
            on:focus={() =>
              focus({
                type: "group",
                arr: menu.data.groups,
                idx,
                id: group.id,
              })}
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
                on:focus={() =>
                  focus({
                    type: "item",
                    arr: group.items,
                    idx,
                    id: item.id,
                  })}
                on:blur={blur}
              />
              <div contenteditable="true" bind:innerHTML={item.price} />
            </div>
            <div contenteditable="true" bind:innerHTML={item.description} />
          </div>
        {/each}
        <button class:hidden={!isEditable} on:click={() => insertItem(group)}>
          아이템추가
        </button>
      </div>
    {/each}
    <button class:hidden={!isEditable} on:click={insertGroup}>
      그룹추가
    </button>
  </section>

  <section id="footers">
    {#each menu.data.footers || [] as footer, idx (footer.id)}
      <div
        class:out-of-stock={footer.out}
        contenteditable="true"
        bind:innerHTML={footer.value}
        id={footer.id}
        on:focus={() =>
          focus({
            type: "footer",
            arr: menu.data.footers,
            idx,
            id: footer.id,
          })}
        on:blur={blur}
      />
    {/each}
    <button class:hidden={!isEditable} on:click={insertFooter}>
      푸터추가
    </button>
  </section>

  <section>
    <div class="text-right font-extralight text-sm">
      Created via <a href={PUBLIC_MAIN_KEY}>Menupi</a> 2024
    </div>
  </section>
</main>
