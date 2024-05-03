type Menu = {
  id: number
  key: string
  email: string
  data: MenuData
}

type MenuData = {
  version: 2
  title: Title
  headers: Header[]
  groups: Group[]
  footers: Footer[]
  template: string
  scripts: string[]
  styles: string[]
}

type Title = { id?: string; value: string; src?: string }
type Header = { id?: string; value: string; src?: string }
type Group = {
  id?: string
  name: string
  col?: string
  items: Item[]
  src?: string
}
type Item = {
  id?: string
  name: string
  price: string
  description?: string
  out?: boolean
  src?: string
}
type Footer = { id?: string; value: string; src?: string }
