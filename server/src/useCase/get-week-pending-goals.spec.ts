import { describe, expect, it } from 'vitest'
import { makeUser } from '../factories/make-user'
import { makeGoal } from '../factories/make-goal'
import { makeGoalCompletion } from '../factories/make-goal-completion'
import { getWeekPendingGoals } from './get-week-pending-goals'

describe('get week pending goals', () => {
  it('should be able to get week pending goals', async () => {
    const user = await makeUser()

    const goal1 = await makeGoal({
      userId: user.id,
      title: 'meditate',
      desiredWeeklyFrequency: 2
    })
    const goal2 = await makeGoal({
      userId: user.id,
      title: 'swimming',
      desiredWeeklyFrequency: 1
    })

    await makeGoal({
      userId: user.id,
      title: 'read',
      desiredWeeklyFrequency: 4
    })

    await makeGoalCompletion({ goalId: goal1.id })
    await makeGoalCompletion({ goalId: goal2.id })

    const result = await getWeekPendingGoals({
      userId: user.id
    })

    expect(result).toEqual({
      pendingGoals: expect.arrayContaining([
        expect.objectContaining({
          title: 'meditate',
          desiredWeeklyFrequency: 2,
          completionCount: 1
        }),
        expect.objectContaining({
          title: 'swimming',
          desiredWeeklyFrequency: 1,
          completionCount: 1
        }),
        expect.objectContaining({
          title: 'read',
          desiredWeeklyFrequency: 4,
          completionCount: 0
        })
      ])
    })
  })
})
