import {
  WEB_GOOGLE_CLIENT_ID,
  WEB_GOOGLE_CLIENT_SECRET,
  WEB_GOOGLE_REDIRECT_URI,
} from "$env/static/private"

export const GET = async (request) => {
  const searchParams = new URL(request.url).searchParams

  const TOKEN_URI = "https://oauth2.googleapis.com/token"

  const params = new URLSearchParams()
  params.append("code", searchParams.get("code") as string)
  params.append("client_id", WEB_GOOGLE_CLIENT_ID)
  params.append("client_secret", WEB_GOOGLE_CLIENT_SECRET)
  params.append("redirect_uri", WEB_GOOGLE_REDIRECT_URI)
  params.append("grant_type", "authorization_code")

  const tokenResponse = await fetch(TOKEN_URI, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  })

  const token: string = (await tokenResponse.json()).id_token

  const headers = new Headers()
  headers.append("Location", "/")

  // const secure = " HttpOnly; Secure; SameSite=Strict;"
  const secure = ""
  headers.append("Set-Cookie", `token=${token}; Path=/;` + secure)

  // 성공적으로 사용자를 생성한 경우 Redirect
  return new Response(undefined, {
    status: 302,
    headers: headers,
  })
  // throw redirect(302, "/")
}
