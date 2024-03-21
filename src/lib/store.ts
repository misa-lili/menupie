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
  const menuValue = get(menu)
  const dataValue = menuValue.data

  const response = fetch(`/api/v1/menus/${menuValue.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(dataValue),
  })

  return response
}
