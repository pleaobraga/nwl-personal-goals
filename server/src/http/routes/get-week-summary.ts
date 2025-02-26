import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekSummary } from '../../useCase/get-week-summary'
import { z } from 'zod'

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/summary',
    {
      schema: {
        tags: ['goals'],
        description: 'Get week summary',
        response: {
          200: z.object({
            summary: z.object({
              completed: z.number(),
              total: z.number(),
              goalsPerDay: z.record(
                z.string(),
                z.array(
                  z.object({
                    id: z.string(),
                    title: z.string(),
                    createdAt: z.string()
                  })
                )
              )
            })
          })
        }
      }
    },
    async () => {
      const { summary } = await getWeekSummary()

      return { summary }
    }
  )
}
