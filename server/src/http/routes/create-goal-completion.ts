import { z } from 'zod'
import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { createGoalCompletion } from '../../useCase/create-goal-completion'

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    '/goal-completion',
    {
      schema: {
        body: z.object({
          goalId: z.string(),
        }),
      },
    },
    async (request) => {
      const { goalId } = request.body

      await createGoalCompletion({
        goalId,
      })
    }
  )
}
