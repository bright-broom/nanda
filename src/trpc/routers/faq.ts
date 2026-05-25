import { z } from 'zod'
import { listFaqs, searchFaqs } from '@/application/faq/search'
import { createFaq, deleteFaq, updateFaq } from '@/application/faq/manage'
import { protectedProcedure, publicProcedure, router } from '@/trpc/init'

const faqInputSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  keywords: z.array(z.string()).default([]),
  category: z.string().nullable().optional(),
  order: z.number().int().optional(),
})

export const faqRouter = router({
  search: publicProcedure
    .input(z.object({ query: z.string().default('') }))
    .query(({ ctx, input }) => searchFaqs({ tenantId: ctx.tenantId, query: input.query })),

  list: protectedProcedure.query(({ ctx }) => listFaqs(ctx.tenantId)),

  create: protectedProcedure
    .input(faqInputSchema)
    .mutation(({ ctx, input }) => createFaq({ tenantId: ctx.tenantId, data: input })),

  update: protectedProcedure
    .input(z.object({ id: z.string().uuid(), data: faqInputSchema.partial() }))
    .mutation(({ ctx, input }) =>
      updateFaq({ tenantId: ctx.tenantId, id: input.id, data: input.data }),
    ),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => deleteFaq({ tenantId: ctx.tenantId, id: input.id })),
})
