import { eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { db } from '@/infrastructure/db/client'
import { tenants, tickets } from '@/infrastructure/db/schema'
import { inngest } from '@/infrastructure/queue/inngest'

export type CreateTicketInput = {
  tenantId: string
  flowId?: string | null
  senderEmail: string
  senderName?: string | null
  category?: string | null
  subject: string
  body: string
  metadata?: Record<string, unknown>
}

export const createTicket = async (input: CreateTicketInput) => {
  const [tenant] = await db
    .select({ notifyEmail: tenants.notifyEmail })
    .from(tenants)
    .where(eq(tenants.id, input.tenantId))
    .limit(1)

  if (!tenant) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Tenant not found' })
  }

  const [ticket] = await db
    .insert(tickets)
    .values({
      tenantId: input.tenantId,
      flowId: input.flowId ?? null,
      senderEmail: input.senderEmail,
      senderName: input.senderName ?? null,
      category: input.category ?? null,
      subject: input.subject,
      body: input.body,
      metadata: input.metadata ?? {},
    })
    .returning()

  await inngest.send({
    name: 'ticket/created',
    data: {
      ticketId: ticket.id,
      tenantId: ticket.tenantId,
      subject: ticket.subject,
      body: ticket.body,
      senderEmail: ticket.senderEmail,
      senderName: ticket.senderName,
      notifyEmail: tenant.notifyEmail,
    },
  })

  return ticket
}
