import { router } from './init'
import { faqRouter } from './routers/faq'
import { flowRouter } from './routers/flow'
import { ticketRouter } from './routers/ticket'

export const appRouter = router({
  faq: faqRouter,
  flow: flowRouter,
  ticket: ticketRouter,
})

export type AppRouter = typeof appRouter
