type GoogleTokenPayload = {
  at_hash: string
  aud: string
  azp: string
  email: string
  email_verified: boolean
  exp: number
  family_name: string
  given_name: string
  iat: number
  iss: string
  name: string
  picture: string
  sub: string
}

type TokenPayload = Partial<GoogleTokenPayload> & {
  email: string
  name: string
  picture: string
}

type MenuHandle = {
  id: number
  key: string
}
