import { env } from '../env'

interface AccessTokenResponse {
  access_token: string
}

interface GetUserReponse {
  id: number
  name: string | null
  email: string | null
  avatar_url: string
}

export async function getAccessTokenFromCode(code: string) {
  const accessTokernURL = new URL('https://github.com/login/oauth/access_token')
  accessTokernURL.searchParams.set('client_id', env.GITHUB_CLIENT_ID)
  accessTokernURL.searchParams.set('client_secret', env.GITHUB_CLIENT_SECRET)
  accessTokernURL.searchParams.set('code', code)

  const response = await fetch(accessTokernURL, {
    method: 'POST',
    headers: {
      Accept: 'application/json'
    }
  })

  const { access_token } = (await response.json()) as AccessTokenResponse

  return access_token
}

export async function getUserFromAccessToken(accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  const data = (await response.json()) as GetUserReponse

  return data
}
