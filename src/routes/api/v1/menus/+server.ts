import { pool } from "$lib/server/db/connection"
import verifyToken from "$lib/server/utils/verifyToken"
import { error } from "@sveltejs/kit"

export const POST = async ({ cookies, request }) => {
  const token = cookies.get("token")
  const tokenPayload = await verifyToken(token)

  if (!tokenPayload.email) throw error(403, "Forbidden")

  const email = tokenPayload.email
  const { key } = await request.json()

  const client = await pool.connect()
  await client.query(
    /* sql */ `
      INSERT INTO menus (key, email, data)
      VALUES ($1, $2, $3);`,
    [
      String(key).toLowerCase(),
      email,
      JSON.stringify({
        title: { value: key },
        headers: [],
        groups: [],
        footers: [],
        template: "Skeleton",
        scripts: [],
        styles: [],
      }),
    ],
  )
  client.release()

  const headers = new Headers()
  headers.append("Location", `/${key}`)
  return new Response(undefined, {
    status: 302,
    headers: headers,
  })
}
