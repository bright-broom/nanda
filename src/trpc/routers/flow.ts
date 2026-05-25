import { z } from 'zod'
import { loadActiveFlow, loadFlow } from '@/application/flow/load'
import { publicProcedure, router } from '@/trpc/init'

export const flowRouter = router({
  active: publicProcedure.query(({ ctx }) => loadActiveFlow(ctx.tenantId)),

  byId: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => loadFlow({ tenantId: ctx.tenantId, id: input.id })),
})
