import { PGUSER, PGHOST, PGDB, PGPW, PGPORT } from "$env/static/private"
const pkg = await import("pg")
const { Pool } = pkg.default

const config = {
  user: PGUSER,
  host: PGHOST,
  database: PGDB,
  password: PGPW,
  port: Number(PGPORT),
}

export const pool = new Pool(config)
