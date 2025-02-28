import dayjs from 'dayjs'
import weekOfYear from 'dayjs/plugin/weekOfYear'
import { and, eq, gte, lte, sql, desc } from 'drizzle-orm'
import { goals, goalsCompletions } from '../db/schema'
import { db } from '../db'

dayjs.extend(weekOfYear)

interface Request {
  userId: string
  weekStartsAt: Date
}

export async function getWeekSummary({ userId, weekStartsAt }: Request) {
  const firstDayOfWeek = weekStartsAt
  const lastDatOfWeek = dayjs(weekStartsAt).endOf('week').toDate()

  const goalsCreatedUpToWeek = db.$with('goals_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt
      })
      .from(goals)
      .where(and(lte(goals.createdAt, lastDatOfWeek), eq(goals.userId, userId)))
  )

  const goalsCompletedInWeek = db.$with('goals_completed_in_week').as(
    db
      .select({
        id: goalsCompletions.id,
        title: goals.title,
        createdAt: goalsCompletions.createdAt,
        completionDate: sql`DATE(${goalsCompletions.createdAt})`.as(
          'completionDate'
        )
      })
      .from(goalsCompletions)
      .innerJoin(goals, eq(goals.id, goalsCompletions.goalId))
      .where(
        and(
          gte(goalsCompletions.createdAt, firstDayOfWeek),
          lte(goalsCompletions.createdAt, lastDatOfWeek),
          eq(goals.userId, userId)
        )
      )
  )

  const goalsCompletedByWeekDay = db.$with('goals_completed_by_week_day').as(
    db
      .select({
        completionDate: goalsCompletedInWeek.completionDate,
        completions: sql<
          { id: string; title: string; createdAt: string }[]
        >/* sql */ `
        JSON_AGG(
          JSON_BUILD_OBJECT(
            'id', ${goalsCompletedInWeek.id},
            'title', ${goalsCompletedInWeek.title},
            'createdAt', ${goalsCompletedInWeek.createdAt}
          )
        )
      `.as('completions')
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completionDate)
      .orderBy(desc(goalsCompletedInWeek.completionDate))
  )

  type Summary = Record<
    string,
    { id: string; title: string; createdAt: string }[]
  >

  const [summary] = await db
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql<number>/*sql*/ `
        (SELECT COUNT(*) FROM ${goalsCompletedInWeek})::DECIMAL
      `.mapWith(Number),
      total: sql<number>/*sql*/ `
        (SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})::DECIMAL
      `.mapWith(Number),
      goalsPerDay: sql<Summary>/*sql*/ `
        JSON_OBJECT_AGG(${goalsCompletedByWeekDay.completionDate}, ${goalsCompletedByWeekDay.completions})
      `
    })
    .from(goalsCompletedByWeekDay)

  return { summary }
}
