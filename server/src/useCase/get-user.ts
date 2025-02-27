import { db } from '../db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

interface Request {
  userId: string
}

export async function getUser({ userId }: Request) {
  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      avatarUrl: users.avatarUrl
    })
    .from(users)
    .where(eq(users.id, userId))

  const user = result[0]

  return {
    user
  }
}
