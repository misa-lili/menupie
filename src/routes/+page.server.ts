import type { Actions } from "./$types"
import { redirect } from "@sveltejs/kit"
import {
  WEB_GOOGLE_CLIENT_ID,
  WEB_GOOGLE_REDIRECT_URI,
} from "$env/static/private"
import * as jose from "jose"
import verifyToken from "$lib/server/utils/verifyToken"
import { pool } from "$lib/server/db/connection"

export const actions = {
  auth: async () => {
    const url = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    url.searchParams.append("client_id", WEB_GOOGLE_CLIENT_ID)
    url.searchParams.append("redirect_uri", WEB_GOOGLE_REDIRECT_URI)
    url.searchParams.append("response_type", "code")
    url.searchParams.append("scope", "email profile")
    url.searchParams.append("access_type", "offline")
    url.searchParams.append("prompt", "consent")

    throw redirect(302, url.toString())
  },
} satisfies Actions

export const load = async (request) => {
  try {
    const token = request.cookies.get("token")
    const tokenPayload = await verifyToken(token)

    const client = await pool.connect()
    const result = await client.query(
      /*sql*/ `
      SELECT key FROM menus WHERE email = $1;
      `,
      [tokenPayload.email],
    )
    client.release()

    return {
      tokenPayload,
      menuKeys: result.rows.map((row) => row.key),
    }
  } catch (error: unknown) {
    return null
  }
}
