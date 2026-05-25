import { z } from 'zod'
import { createTicket } from '@/application/ticket/createTicket'
import { getTicket, listTickets } from '@/application/ticket/queries'
import { addComment, assignTicket, updateTicketStatus } from '@/application/ticket/updateStatus'
import { TICKET_STATUSES } from '@/domain/ticket/values'
import { protectedProcedure, publicProcedure, router } from '@/trpc/init'

const statusEnum = z.enum(TICKET_STATUSES)

export const ticketRouter = router({
  create: publicProcedure
    .input(
      z.object({
        flowId: z.string().uuid().nullable().optional(),
        senderEmail: z.string().email(),
        senderName: z.string().nullable().optional(),
        category: z.string().nullable().optional(),
        subject: z.string().min(1),
        body: z.string().min(1),
        metadata: z.record(z.string(), z.unknown()).optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      createTicket({
        tenantId: ctx.tenantId,
        flowId: input.flowId ?? null,
        senderEmail: input.senderEmail,
        senderName: input.senderName ?? null,
        category: input.category ?? null,
        subject: input.subject,
        body: input.body,
        metadata: input.metadata ?? {},
      }),
    ),

  list: protectedProcedure
    .input(z.object({ status: statusEnum.optional() }).default({}))
    .query(({ ctx, input }) => listTickets({ tenantId: ctx.tenantId, status: input.status })),

  byId: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(({ ctx, input }) => getTicket({ tenantId: ctx.tenantId, id: input.id })),

  updateStatus: protectedProcedure
    .input(z.object({ id: z.string().uuid(), status: statusEnum }))
    .mutation(({ ctx, input }) =>
      updateTicketStatus({ tenantId: ctx.tenantId, id: input.id, status: input.status }),
    ),

  assign: protectedProcedure
    .input(z.object({ id: z.string().uuid(), assignedTo: z.string().nullable() }))
    .mutation(({ ctx, input }) =>
      assignTicket({ tenantId: ctx.tenantId, id: input.id, assignedTo: input.assignedTo }),
    ),

  addComment: protectedProcedure
    .input(z.object({ ticketId: z.string().uuid(), body: z.string().min(1) }))
    .mutation(({ ctx, input }) =>
      addComment({
        tenantId: ctx.tenantId,
        ticketId: input.ticketId,
        authorId: ctx.userId,
        body: input.body,
      }),
    ),
})
