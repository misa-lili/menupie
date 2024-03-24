import { writable, get } from "svelte/store"

export const menus = writable<MenuHandle[]>([])
export const menu = writable<Menu>({
  id: 0,
  key: "",
  email: "",
  data: {
    title: { value: "" },
    headers: [],
    groups: [],
    footers: [],
    template: "",
    scripts: [],
    styles: [],
  },
})
export const tokenPayload = writable<Partial<GoogleTokenPayload>>({})
export const isOwner = writable<boolean>(false)
export const isAdmin = writable<boolean>(false)
export const isOpen = writable<boolean>(false)
export const isEditable = writable<boolean>(false)

function createEventBus() {
  const { subscribe, set } = writable({})

  return {
    subscribe,
    trigger: (event: string, detail: any) => {
      set({ event, detail })
    },
  }
}

export const eventBus = createEventBus()
