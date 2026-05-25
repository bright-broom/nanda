import { NOTIFY_FROM, resend } from '@/infrastructure/email/resend'
import { TicketNotificationEmail } from '@/infrastructure/email/templates/TicketNotification'
import { inngest } from './inngest'

export const notifyOnTicketCreated = inngest.createFunction(
  {
    id: 'notify-on-ticket-created',
    triggers: [{ event: 'ticket/created' }],
    retries: 3,
  },
  async ({ event }) => {
    const data = event.data as {
      subject: string
      body: string
      senderEmail: string
      senderName: string | null
      notifyEmail: string
      ticketId: string
    }
    await resend.emails.send({
      from: NOTIFY_FROM,
      to: data.notifyEmail,
      subject: `[新着] ${data.subject}`,
      react: TicketNotificationEmail({
        subject: data.subject,
        body: data.body,
        senderEmail: data.senderEmail,
        senderName: data.senderName,
        ticketId: data.ticketId,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      }),
    })
    return { delivered: true }
  },
)

export const functions = [notifyOnTicketCreated]
