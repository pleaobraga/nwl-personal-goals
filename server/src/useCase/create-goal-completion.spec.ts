import { describe, expect, it } from 'vitest'
import { makeUser } from '../factories/make-user'
import { makeGoal } from '../factories/make-goal'
import { createGoalCompletion } from './create-goal-completion'
import { makeGoalCompletion } from '../factories/make-goal-completion'

describe('create goal completion', () => {
  it('should be able to complete a goal', async () => {
    const user = await makeUser()
    const goal = await makeGoal({ userId: user.id })

    const result = await createGoalCompletion({
      userId: user.id,
      goalId: goal.id
    })

    expect(result).toEqual({
      goalCompletion: expect.objectContaining({
        id: expect.any(String),
        goalId: goal.id
      })
    })
  })

  it('should not  be able to complete a goal more time then it expects', async () => {
    const user = await makeUser()
    const goal = await makeGoal({ userId: user.id, desiredWeeklyFrequency: 1 })

    await makeGoalCompletion({ goalId: goal.id })

    await expect(
      createGoalCompletion({
        userId: user.id,
        goalId: goal.id
      })
    ).rejects.toThrow()
  })
})
