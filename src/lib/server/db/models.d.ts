type Menu = {
  id: number
  key: string
  email: string
  data: MenuData
}

type MenuData = {
  title: Title
  headers: Header[]
  groups: Group[]
  footers: Footer[]
  template: string
  scripts: string[]
  styles: string[]
}

type Title = { id?: string; value: string }
type Header = { id?: string; value: string }
type Group = {
  id?: string
  name: string
  col?: string
  items: Item[]
}
type Item = {
  id?: string
  name: string
  price: string
  description?: string
  out?: boolean
}
type Footer = { id?: string; value: string }
