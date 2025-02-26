import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoal } from '../../useCase/create-goal'

export const createGoalRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/goals',
    {
      schema: {
        tags: ['goals'],
        description: 'Create Goals',
        body: z.object({
          title: z.string(),
          desiredWeeklyFrequency: z.number().int().min(1).max(7)
        }),
        response: {
          201: z.null()
        }
      }
    },
    async (request, reply) => {
      const { desiredWeeklyFrequency, title } = request.body

      await createGoal({
        title,
        desiredWeeklyFrequency
      })

      return reply.status(201).send()
    }
  )
}
