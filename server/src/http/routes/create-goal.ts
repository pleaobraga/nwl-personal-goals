import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoal } from '../../useCase/create-goal'
import { authenticateUserHook } from '../hooks/authenticate-user'

export const createGoalRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/goals',
    {
      onRequest: [authenticateUserHook],
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
      const userId = request.user.sub
      const { desiredWeeklyFrequency, title } = request.body

      await createGoal({
        userId,
        title,
        desiredWeeklyFrequency
      })

      return reply.status(201).send()
    }
  )
}
