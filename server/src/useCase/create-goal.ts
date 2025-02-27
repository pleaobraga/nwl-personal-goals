import { db } from '../db'
import { goals } from '../db/schema'

interface CreateGoalRequest {
  title: string
  desiredWeeklyFrequency: number
  userId: string
}

export async function createGoal({
  desiredWeeklyFrequency,
  title,
  userId
}: CreateGoalRequest) {
  const result = await db
    .insert(goals)
    .values({
      userId,
      title,
      desiredWeeklyFrequency
    })
    .returning()

  const goal = result[0]

  return {
    goal
  }
}
