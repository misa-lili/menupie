import * as jose from "jose"

export const load = async ({ cookies, params }) => {
  try {
    const token = cookies.get("token")
    return { token: jose.decodeJwt<GoogleTokenPayload>(token ?? "") }
  } catch (error: unknown) {
    return null
  }
}
