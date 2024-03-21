import { pool } from "$lib/server/db/connection"
import verifyToken from "$lib/server/utils/verifyToken.js"
import { error } from "@sveltejs/kit"

export const GET = async (request) => {
  const token = request.cookies.get("token")
  const tokenPayload = await verifyToken(token)

  if (tokenPayload.email !== "hakgeumkim@gmail.com")
    throw error(403, "Forbidden")

  const client = await pool.connect()

  await client.query(/* sql */ `
    DROP TABLE IF EXISTS menus;
    CREATE TABLE menus (
      id SERIAL PRIMARY KEY, -- 이것도 URL로 사용될 것임, 불변하는 URL
      key VARCHAR(255) UNIQUE NOT NULL, -- 이것도 URL로 사용될 것임, 가변하는 URL
      email VARCHAR(255) NOT NULL, -- 토큰에 있는 이메일과 일치해야 함
      data JSONB
    );
  `)
  client.release()

  return new Response()
}
