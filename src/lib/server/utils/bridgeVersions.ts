/**
 * database에서 불러들일떄 legacy data를 최신 버전으로 변환하는 함수
 * @param data
 * @returns
 */
export default function bridgeVersions(data: MenuData): MenuData {
  data.title.id = data.title.id ?? crypto.randomUUID()

  data.headers = data.headers.map((header) => {
    header.id = header.id || crypto.randomUUID()
    return header
  })

  data.groups = data.groups.map((group) => {
    group.id = group.id || crypto.randomUUID()
    group.items = group.items.map((item) => {
      item.id = item.id || crypto.randomUUID()
      return item
    })
    return group
  })

  data.footers = data.footers.map((footer) => {
    footer.id = footer.id || crypto.randomUUID()
    return footer
  })

  return data
}
