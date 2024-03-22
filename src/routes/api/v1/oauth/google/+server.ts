import { WEB_GOOGLE_CLIENT_SECRET } from "$env/static/private"
import {
  PUBLIC_WEB_GOOGLE_CLIENT_ID,
  PUBLIC_WEB_GOOGLE_REDIRECT_PATH,
} from "$env/static/public"

export const GET = async ({ url }) => {
  const TOKEN_URI = "https://oauth2.googleapis.com/token"
  const redirectUri = url.origin + PUBLIC_WEB_GOOGLE_REDIRECT_PATH

  const params = new URLSearchParams()
  params.append("code", url.searchParams.get("code") as string)
  params.append("client_id", PUBLIC_WEB_GOOGLE_CLIENT_ID)
  params.append("client_secret", WEB_GOOGLE_CLIENT_SECRET)
  params.append("redirect_uri", redirectUri)
  params.append("grant_type", "authorization_code")

  const tokenResponse = await fetch(TOKEN_URI, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  const body = await tokenResponse.json()
  if (tokenResponse.status !== 200) {
    console.log(redirectUri)
    console.log(body)
  }

  const token: string = body.id_token

  const headers = new Headers()
  const state = url.searchParams.get("state") || "/"
  console.log("token", token)
  console.log("state", state)
  headers.append("Location", state)

  // const secure = " HttpOnly; Secure; SameSite=Strict;"
  const secure = ""
  headers.append("Set-Cookie", `token=${token}; Path=/;` + secure)

  // 성공적으로 사용자를 생성한 경우 Redirect
  return new Response(undefined, {
    status: 302,
    headers: headers,
  })
}
