import dayjs from 'dayjs'
import { db } from '../db'
import { goals, goalsCompletions } from '../db/schema'
import { count, gte, lte, and, eq, sql } from 'drizzle-orm'

interface Request {
  goalId: string
  userId: string
}

export async function createGoalCompletion({ goalId, userId }: Request) {
  const firstDayOfWeek = dayjs().startOf('week').toDate()
  const lastDayOfWeek = dayjs().endOf('week').toDate()

  const goalCompletionCounts = db.$with('goal_completion_counts').as(
    db
      .select({
        goalId: goalsCompletions.goalId,
        completionCount: count(goalsCompletions.id).as('completionCount')
      })
      .from(goalsCompletions)
      .innerJoin(goals, eq(goals.id, goalsCompletions.goalId))
      .where(
        and(
          gte(goalsCompletions.createdAt, firstDayOfWeek),
          lte(goalsCompletions.createdAt, lastDayOfWeek),
          eq(goalsCompletions.goalId, goalId),
          eq(goals.userId, userId)
        )
      )
      .groupBy(goalsCompletions.goalId)
  )

  const result = await db
    .with(goalCompletionCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount:
        sql/*sql*/ `COALESCE(${goalCompletionCounts.completionCount}, 0)`.mapWith(
          Number
        )
    })
    .from(goals)
    .leftJoin(goalCompletionCounts, eq(goalCompletionCounts.goalId, goals.id))
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)))
    .limit(1)

  const { completionCount, desiredWeeklyFrequency } = result[0]

  if (completionCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed this week')
  }

  const insertResult = await db
    .insert(goalsCompletions)
    .values({ goalId })
    .returning()

  const goalCompletion = insertResult[0]

  return {
    goalCompletion
  }
}
