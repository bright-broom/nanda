import { and, asc, desc, eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { db } from '@/infrastructure/db/client'
import { ticketComments, tickets } from '@/infrastructure/db/schema'
import type { TicketStatus } from '@/domain/ticket/values'

export const listTickets = async (params: {
  tenantId: string
  status?: TicketStatus
}) => {
  const whereClause = params.status
    ? and(eq(tickets.tenantId, params.tenantId), eq(tickets.status, params.status))
    : eq(tickets.tenantId, params.tenantId)

  return db.select().from(tickets).where(whereClause).orderBy(desc(tickets.createdAt))
}

export const getTicket = async (params: { tenantId: string; id: string }) => {
  const [ticket] = await db
    .select()
    .from(tickets)
    .where(and(eq(tickets.id, params.id), eq(tickets.tenantId, params.tenantId)))
    .limit(1)
  if (!ticket) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
  }
  const comments = await db
    .select()
    .from(ticketComments)
    .where(eq(ticketComments.ticketId, ticket.id))
    .orderBy(asc(ticketComments.createdAt))
  return { ticket, comments }
}
