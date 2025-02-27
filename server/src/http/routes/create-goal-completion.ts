import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoalCompletion } from '../../useCase/create-goal-completion'
import { authenticateUserHook } from '../hooks/authenticate-user'

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/goal-completion',
    {
      onRequest: [authenticateUserHook],
      schema: {
        tags: ['goals'],
        description: 'Complete a goal',
        body: z.object({
          goalId: z.string()
        }),
        response: {
          201: z.null()
        }
      }
    },
    async (request, reply) => {
      const userId = request.user.sub
      const { goalId } = request.body

      await createGoalCompletion({
        goalId,
        userId
      })

      return reply.status(201).send()
    }
  )
}
