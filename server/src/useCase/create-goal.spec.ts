import { describe, expect, it } from 'vitest'
import { makeUser } from '../factories/make-user'
import { createGoal } from './create-goal'

describe('create goal', () => {
  it('should be able to create a new goal', async () => {
    const user = await makeUser()

    const result = await createGoal({
      userId: user.id,
      title: 'example goal',
      desiredWeeklyFrequency: 5
    })

    expect(result).toEqual({
      goal: expect.objectContaining({
        id: expect.any(String),
        title: 'example goal',
        desiredWeeklyFrequency: 5
      })
    })
  })
})
