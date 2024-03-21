import { jwtVerify, importJWK } from "jose"
import getGooglePublicKeys from "./getGooglePublicKey"
import { WEB_GOOGLE_CLIENT_ID, ADMIN_EMAILS } from "$env/static/private"
import { error } from "@sveltejs/kit"

/** 구글 토큰을 verify 합니다.
 * 또한 admin email에 포함될 경우 isAdmin을 true로 설정합니다.
 */
export default async function verifyToken(
  token: string | undefined,
): Promise<{ isAdmin: boolean } & GoogleTokenPayload> {
  if (!token) error(401, "No token provided")

  try {
    const publicKeys = await getGooglePublicKeys()
    const keyOptions = {
      algorithms: ["RS256"],
      issuer: "https://accounts.google.com",
      audience: WEB_GOOGLE_CLIENT_ID,
    }

    for (const key of publicKeys.keys) {
      try {
        const publicKey = await importJWK({
          kty: key.kty,
          n: key.n,
          e: key.e,
          alg: key.alg,
          use: key.use,
          kid: key.kid,
        })
        const payload = (await jwtVerify(token, publicKey, keyOptions))
          .payload as GoogleTokenPayload

        return {
          ...payload,
          isAdmin: ADMIN_EMAILS.split(",").includes(payload.email),
        }
      } catch (verificationError) {
        console.log(
          "Verification failed with the current key. Trying the next key.",
        )
        // 현재 키로 검증 실패 시 다음 키로 시도
        continue
      }
    }

    // 모든 키로 검증 실패 시 에러 throw
    throw new Error("Invalid token")
  } catch (unknownError) {
    throw error(401, String(unknownError))
  }
}
