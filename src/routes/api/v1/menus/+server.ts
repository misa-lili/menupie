import { pool } from "$lib/server/db/connection"
import verifyToken from "$lib/server/utils/verifyToken"
import { error, redirect } from "@sveltejs/kit"

export const POST = async ({ cookies, request }) => {
  const token = cookies.get("token")
  const tokenPayload = await verifyToken(token)

  if (!tokenPayload.email) throw error(403, "Forbidden")

  const email = tokenPayload.email
  const { key } = await request.json()

  const client = await pool.connect()
  const result = await client.query(
    /* sql */ `
      INSERT INTO menus (key, email, data)
      VALUES ($1, $2, $3)
      RETURNING id, key;
    `,
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

  // const headers = new Headers()
  // headers.append("Location", `/${key}`)
  // return new Response(undefined, {
  //   status: 302,
  //   headers: headers,
  // })
  // return redirect(302, `/${key}`)
  return new Response(JSON.stringify(result.rows[0]))
}
