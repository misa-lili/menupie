<script lang="ts">
  import Fuse from "fuse.js"
  import * as Hangul from "hangul-js"
  import { onMount } from "svelte"

  export let menu: Menu

  let fuse: Fuse<any>
  let searchInput: HTMLInputElement
  let resultsDiv: HTMLDivElement

  interface FuseItem {
    element: Element
    text: string
  }

  $: if (menu?.groups?.length > 0) search()

  const search = () => {
    const list: FuseItem[] = [...window.document.body.getElementsByTagName("*")]
      .filter((element) => {
        return (
          element.className === "_item_name" ||
          element.className === "_group_name" ||
          element.className === "_item_description" ||
          element.className === "_item_price"
        )
      })
      .map((element) => ({
        element,
        text: Hangul.disassembleToString(element.textContent) || "",
        display: element.textContent,
      }))

    const options = {
      keys: ["text"], // 검색할 객체의 key 지정
      includeScore: true,
      findAllMatches: true,
      threshold: 0.5, // 유사도 임계값 조절
      minMatchCharLength: 1,
    }

    fuse = new Fuse(list, options)

    searchInput.addEventListener("input", function () {
      const value = Hangul.disassembleToString(this.value)
      resultsDiv.innerHTML = ""

      if (value.length > 1) {
        const results = fuse.search(value)
        if (results.length > 0) {
          results.forEach((result) => {
            const div = document.createElement("div")
            div.classList.add("result")
            div.textContent = result.item.display
            resultsDiv.appendChild(div)
            div.addEventListener("click", () => {
              searchInput.value = ""
              searchInput.dispatchEvent(new Event("input"))
              removeAllHighlights()
              const item = result.item.element.closest("._item")
              item.scrollIntoView({ behavior: "smooth", block: "center" })
              item.classList.add("highlight")
            })
          }, true)
        } else {
          resultsDiv.innerHTML = "<div>검색 결과가 없습니다.</div>"
        }
      }
    })
  }

  onMount(() => {
    document.addEventListener("click", (event) => {
      if (!event.target.classList.contains("result")) {
        removeAllHighlights()
      }
    })
  })

  function removeAllHighlights() {
    const highlightedItems = document.querySelectorAll(".highlight")
    highlightedItems.forEach((item) => item.classList.remove("highlight"))
  }
</script>

<input bind:this={searchInput} type="text" id="search" placeholder="검색..." />
<div bind:this={resultsDiv} id="results" />
