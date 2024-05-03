import { writable } from "svelte/store"

export const store_menus = writable<MenuHandle[]>([])
export const store_menu = writable<Menu>({
  id: 0,
  key: "",
  email: "",
  data: {
    version: 2,
    title: { value: "" },
    headers: [],
    groups: [],
    footers: [],
    template: "",
    scripts: [],
    styles: [],
  },
})
export const store_tokenPayload = writable<Partial<GoogleTokenPayload>>({})
export const store_isOwner = writable<boolean>(false)
export const store_isAdmin = writable<boolean>(false)
export const store_isOpen = writable<boolean>(false)
export const store_isEditable = writable<boolean>(false)

function createEventBus() {
  const { subscribe, set } = writable({})

  return {
    subscribe,
    trigger: (event: string, detail: any) => {
      set({ event, detail })
    },
  }
}

export const store_eventBus = createEventBus()
