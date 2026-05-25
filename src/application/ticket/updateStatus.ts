import { and, eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { db } from '@/infrastructure/db/client'
import { ticketComments, tickets } from '@/infrastructure/db/schema'
import type { TicketStatus } from '@/domain/ticket/values'

export const updateTicketStatus = async (params: {
  tenantId: string
  id: string
  status: TicketStatus
}) => {
  const [row] = await db
    .update(tickets)
    .set({
      status: params.status,
      resolvedAt: params.status === 'resolved' || params.status === 'closed' ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(and(eq(tickets.id, params.id), eq(tickets.tenantId, params.tenantId)))
    .returning()
  if (!row) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
  }
  return row
}

export const assignTicket = async (params: {
  tenantId: string
  id: string
  assignedTo: string | null
}) => {
  const [row] = await db
    .update(tickets)
    .set({ assignedTo: params.assignedTo, updatedAt: new Date() })
    .where(and(eq(tickets.id, params.id), eq(tickets.tenantId, params.tenantId)))
    .returning()
  if (!row) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
  }
  return row
}

export const addComment = async (params: {
  tenantId: string
  ticketId: string
  authorId: string
  body: string
}) => {
  const [ticket] = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(and(eq(tickets.id, params.ticketId), eq(tickets.tenantId, params.tenantId)))
    .limit(1)
  if (!ticket) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Ticket not found' })
  }
  const [comment] = await db
    .insert(ticketComments)
    .values({
      ticketId: params.ticketId,
      authorId: params.authorId,
      body: params.body,
    })
    .returning()
  return comment
}
