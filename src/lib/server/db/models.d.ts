type Menu = {
  title: Title
  headers: Header[]
  groups: Group[]
  footers: Footer[]
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
  groups: Group[]
}
type Item = {
  id?: string
  name: string
  price: string
  description?: string
  image?: string
  out?: boolean
}
type Footer = { id?: string; value: string }
