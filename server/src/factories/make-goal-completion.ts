import { db } from '../db'
import { goalsCompletions } from '../db/schema'
import { InferSelectModel } from 'drizzle-orm'

export async function makeGoalCompletion(
  override: Partial<InferSelectModel<typeof goalsCompletions>> &
    Pick<InferSelectModel<typeof goalsCompletions>, 'goalId'>
) {
  const [result] = await db
    .insert(goalsCompletions)
    .values(override)
    .returning()

  return result
}
