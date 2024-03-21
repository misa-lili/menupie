import { pool } from "$lib/server/db/connection"
import verifyToken from "$lib/server/utils/verifyToken"
import { redirect } from "@sveltejs/kit"
import { ADMIN_EMAILS } from "$env/static/private"
import { menu as storeMenu } from "$lib/store.js"
import { get } from "svelte/store"

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

  const menu = await client
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

  return {
    menus,
    menu,
    tokenPayload,
    isOwner,
    isAdmin,
  }
}
