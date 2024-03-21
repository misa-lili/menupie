import { pool } from "$lib/server/db/connection"
import verifyToken from "$lib/server/utils/verifyToken.js"
import { error } from "@sveltejs/kit"

const sample = {
  title: { value: "main" },
  headers: [],
  groups: [],
  footers: [],
  template: "Skeleton",
  scripts: [],
  styles: [],
}

export const GET = async ({ cookies }) => {
  const token = cookies.get("token")
  const tokenPayload = await verifyToken(token)

  if (tokenPayload.email !== "hakgeumkim@gmail.com")
    throw error(403, "Forbidden")

  const client = await pool.connect()
  await client.query(
    /* sql */ `
    UPDATE menus SET data = $1  WHERE key = 'main';
    `,
    [sample],
  )
  client.release()

  return new Response()
}
