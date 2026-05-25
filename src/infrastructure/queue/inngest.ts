import { Inngest } from 'inngest'

export type TicketCreatedEvent = {
  name: 'ticket/created'
  data: {
    ticketId: string
    tenantId: string
    subject: string
    body: string
    senderEmail: string
    senderName: string | null
    notifyEmail: string
  }
}

export const inngest = new Inngest({ id: 'msgdesk' })
