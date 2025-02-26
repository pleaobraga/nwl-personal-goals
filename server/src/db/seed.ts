import { db, client } from '.'
import { goalsCompletions, goals } from './schema'

async function seed() {
  await db.delete(goalsCompletions)
  await db.delete(goals)

  const goalsData = await db
    .insert(goals)
    .values([
      { title: 'Acordar cedo', desiredWeeklyFrequency: 5 },
      { title: 'Malhar', desiredWeeklyFrequency: 6 },
      { title: 'Ler Livro', desiredWeeklyFrequency: 7 }
    ])
    .returning()

  await db.insert(goalsCompletions).values([
    {
      goalId: goalsData[0].id,
      createdAt: new Date()
    },
    {
      goalId: goalsData[2].id,
      createdAt: new Date()
    }
  ])
}

seed().finally(() => {
  client.end()
})
