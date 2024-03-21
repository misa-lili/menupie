import { env } from "$env/dynamic/private"
const pkg = await import("pg")
const { Pool } = pkg.default

const config = {
  user: env.PGUSER,
  host: env.PGHOST,
  database: env.PGDB,
  password: env.PGPW,
  port: Number(env.PGPORT),
}

export const pool = new Pool(config)
