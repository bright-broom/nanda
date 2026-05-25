import type { TicketPriority, TicketStatus } from './values'

export type Ticket = {
  id: string
  tenantId: string
  flowId: string | null
  senderEmail: string
  senderName: string | null
  category: string | null
  subject: string
  body: string
  metadata: Record<string, unknown>
  status: TicketStatus
  priority: TicketPriority
  assignedTo: string | null
  createdAt: Date
  updatedAt: Date
  resolvedAt: Date | null
}
