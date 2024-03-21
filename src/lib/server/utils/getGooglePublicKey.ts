import { WEB_GOOGLE_PUBLIC_KEY_URL } from "$env/static/private"

export default async function getGooglePublicKeys() {
  const response = await fetch(WEB_GOOGLE_PUBLIC_KEY_URL)
  const keys = await response.json()
  return keys
}
