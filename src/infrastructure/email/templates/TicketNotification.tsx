import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export type TicketNotificationProps = {
  subject: string
  body: string
  senderEmail: string
  senderName: string | null
  ticketId: string
  appUrl?: string
}

export function TicketNotificationEmail(props: TicketNotificationProps) {
  const { subject, body, senderEmail, senderName, ticketId, appUrl } = props
  const detailUrl = appUrl ? `${appUrl}/dashboard/tickets/${ticketId}` : null

  return (
    <Html>
      <Head />
      <Preview>新着お問い合わせ: {subject}</Preview>
      <Body style={{ fontFamily: 'sans-serif', backgroundColor: '#f5f5f5', padding: '20px' }}>
        <Container style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '8px' }}>
          <Heading style={{ fontSize: '20px' }}>新着お問い合わせ</Heading>
          <Section>
            <Text>
              <strong>件名:</strong> {subject}
            </Text>
            <Text>
              <strong>送信者:</strong> {senderName ?? '(匿名)'} &lt;{senderEmail}&gt;
            </Text>
            <Text>
              <strong>内容:</strong>
            </Text>
            <Text style={{ whiteSpace: 'pre-wrap', backgroundColor: '#f9f9f9', padding: '12px' }}>
              {body}
            </Text>
            {detailUrl ? (
              <Text>
                ダッシュボードで確認: <a href={detailUrl}>{detailUrl}</a>
              </Text>
            ) : null}
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default TicketNotificationEmail
