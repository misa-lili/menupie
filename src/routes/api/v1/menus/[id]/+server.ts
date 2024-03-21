import { pool } from "$lib/server/db/connection"
import verifyToken from "$lib/server/utils/verifyToken"
import { error } from "@sveltejs/kit"

export const PUT = async ({ cookies, params, request }) => {
  const token = cookies.get("token")
  const tokenPayload = await verifyToken(token)
  const id = params.id
  const data = await request.json()

  if (!tokenPayload.email) throw error(403, "Forbidden")

  const email = tokenPayload.email

  const client = await pool.connect()
  const menu = await client
    .query(
      /* sql */ `
      SELECT * FROM menus WHERE id = $1;`,
      [id],
    )
    .then((result) => result.rows[0])

  if (!menu) throw error(404, "Not Found")

  const isOwner = tokenPayload.email === menu.email

  if (!isOwner) throw error(403, "Forbidden")

  await client.query(
    /* sql */ `
      UPDATE menus SET data = $1 WHERE id = $2;`,
    [data, id],
  )
  client.release()

  return new Response()
}

export const DELETE = async ({ cookies, params }) => {
  const token = cookies.get("token")
  const tokenPayload = await verifyToken(token)
  const id = params.id

  if (!tokenPayload.email) throw error(403, "Forbidden")

  const email = tokenPayload.email

  const client = await pool.connect()
  const menu = await client
    .query(
      /* sql */ `
      SELECT * FROM menus WHERE id = $1;`,
      [id],
    )
    .then((result) => result.rows[0])

  if (!menu) throw error(404, "Not Found")

  const isOwner = tokenPayload.email === menu.email

  if (!isOwner) throw error(403, "Forbidden")

  await client.query(
    /* sql */ `
      DELETE FROM menus WHERE id = $1;`,
    [id],
  )
  client.release()

  return new Response()
}
