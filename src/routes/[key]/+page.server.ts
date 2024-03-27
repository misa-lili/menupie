import { pool } from "$lib/server/db/connection"
import verifyToken from "$lib/server/utils/verifyToken"
import { redirect } from "@sveltejs/kit"
import { ADMIN_EMAILS } from "$env/static/private"
import bridgeVersions from "$lib/server/utils/bridgeVersions.js"

export const load = async ({ cookies, params }) => {
  const tokenPayload: TokenPayload = await verifyToken(cookies.get("token"))

  const client = await pool.connect()

  const menus = await client
    .query(
      /*sql*/ `
        SELECT id, key 
        FROM menus 
        WHERE email = $1;
      `,
      [tokenPayload.email],
    )
    .then((result) => result.rows)

  const menu: Menu = await client
    .query(
      /*sql*/ `
        SELECT * 
        FROM menus 
        WHERE key = $1;
      `,
      [params.key],
    )
    .then((result) => result.rows[0])

  client.release()

  if (!menu) {
    throw redirect(302, "/main")
  }

  const isOwner = tokenPayload.email === menu.email
  const isAdmin = ADMIN_EMAILS.split(",").includes(tokenPayload.email)

  menu.data = bridgeVersions(menu.data)

  const data = {
    menus,
    menu,
    tokenPayload,
    isOwner,
    isAdmin,
  }

  return data
}
