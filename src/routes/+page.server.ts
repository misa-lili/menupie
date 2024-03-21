import { redirect } from "@sveltejs/kit"

export const load = async ({}) => {
  console.log("redirected at /+page.server.ts")
  throw redirect(302, "/main")
}
