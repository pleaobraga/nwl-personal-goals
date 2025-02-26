import { db, client } from '.'
import { goalsCompletions, goals, users } from './schema'

async function seed() {
  await db.delete(goalsCompletions)
  await db.delete(goals)

  const [user] = await db
    .insert(users)
    .values({
      name: 'John Doe',
      externalAccountId: 1212312,
      avatarUrl: 'https://github.com/pleaobraga.png'
    })
    .returning()

  const goalsData = await db
    .insert(goals)
    .values([
      { userId: user.id, title: 'Acordar cedo', desiredWeeklyFrequency: 5 },
      { userId: user.id, title: 'Malhar', desiredWeeklyFrequency: 6 },
      { userId: user.id, title: 'Ler Livro', desiredWeeklyFrequency: 7 }
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
