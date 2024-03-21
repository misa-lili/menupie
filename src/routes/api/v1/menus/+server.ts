import { pool } from "$lib/server/db/connection"
import verifyToken from "$lib/server/utils/verifyToken"

export const POST = async ({ cookies, request }) => {
  const token = cookies.get("token")
  const tokenPayload = await verifyToken(token)

  const email = tokenPayload.email
  const { key } = await request.json()

  const client = await pool.connect()
  await client.query(
    /* sql */ `
    INSERT INTO menus (key, email, data)
    VALUES ($1, $2, $3);`,
    [key, email, {}],
  )
  client.release()

  const headers = new Headers()
  headers.append("Location", `/${key}`)
  return new Response(undefined, {
    status: 302,
    headers: headers,
  })
}
