import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { getWeekSummary } from '../../useCase/get-week-summary'

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async (app) => {
  app.get('/summary', async () => {
    const { sumary } = await getWeekSummary()

    return { sumary }
  })
}
