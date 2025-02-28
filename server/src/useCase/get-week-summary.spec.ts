import { describe, expect, it } from 'vitest'
import { makeUser } from '../factories/make-user'
import { makeGoal } from '../factories/make-goal'
import { makeGoalCompletion } from '../factories/make-goal-completion'
import { getWeekSummary } from './get-week-summary'
import dayjs from 'dayjs'

describe('get week summary', () => {
  it('should be able to get week pending goals', async () => {
    const user = await makeUser()

    const weekStartsAt = dayjs(new Date(2024, 9, 6))
      .startOf('week')
      .toDate()

    const goal1 = await makeGoal({
      userId: user.id,
      title: 'meditate',
      desiredWeeklyFrequency: 2,
      createdAt: weekStartsAt
    })
    const goal2 = await makeGoal({
      userId: user.id,
      title: 'swimming',
      desiredWeeklyFrequency: 1,
      createdAt: weekStartsAt
    })

    const goal3 = await makeGoal({
      userId: user.id,
      title: 'read',
      desiredWeeklyFrequency: 4,
      createdAt: weekStartsAt
    })

    await makeGoalCompletion({
      goalId: goal1.id,
      createdAt: dayjs(weekStartsAt).add(2, 'd').toDate()
    })

    await makeGoalCompletion({
      goalId: goal2.id,
      createdAt: dayjs(weekStartsAt).add(3, 'd').toDate()
    })

    await makeGoalCompletion({
      goalId: goal3.id,
      createdAt: dayjs(weekStartsAt).add(1, 'd').toDate()
    })
    await makeGoalCompletion({
      goalId: goal3.id,
      createdAt: dayjs(weekStartsAt).add(2, 'd').toDate()
    })
    await makeGoalCompletion({
      goalId: goal3.id,
      createdAt: dayjs(weekStartsAt).add(3, 'd').toDate()
    })

    const result = await getWeekSummary({
      userId: user.id,
      weekStartsAt
    })

    expect(result).toEqual({
      summary: {
        total: 7,
        completed: 5,
        goalsPerDay: {
          '2024-10-09': expect.arrayContaining([
            expect.objectContaining({ title: 'read' }),
            expect.objectContaining({ title: 'swimming' })
          ]),
          '2024-10-08': expect.arrayContaining([
            expect.objectContaining({ title: 'read' }),
            expect.objectContaining({ title: 'meditate' })
          ]),
          '2024-10-07': expect.arrayContaining([
            expect.objectContaining({ title: 'read' })
          ])
        }
      }
    })
  })
})
