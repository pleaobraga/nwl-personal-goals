import dayjs from 'dayjs'
import { db } from '../db'
import { goals, goalsCompletions, users } from '../db/schema'
import { count, gte, lte, and, eq, sql } from 'drizzle-orm'
import { env } from '../env'
import {
  getAccessTokenFromCode,
  getUserFromAccessToken
} from '../modules/github-oauth'

interface AuthenticateFromGithubCodeRequest {
  code: string
}

export async function authenticateFromGithubCode({
  code
}: AuthenticateFromGithubCodeRequest) {
  const accessToken = await getAccessTokenFromCode(code)
  const githubUser = await getUserFromAccessToken(accessToken)

  const result = await db
    .select()
    .from(users)
    .where(eq(users.externalAccountId, githubUser.id))

  const userAlreadyExists = result.length > 0

  let userId: string | null

  if (userAlreadyExists) {
    userId = result[0].id
  }

  if (!userAlreadyExists) {
    await db.insert(users).values({
      name: githubUser.name,
      email: githubUser.email,
      avatarUrl: githubUser.avatar_url,
      externalAccountId: githubUser.id
    })
  }

  return {}
}
