export const TICKET_STATUSES = ['open', 'in_progress', 'resolved', 'closed'] as const
export type TicketStatus = (typeof TICKET_STATUSES)[number]

export const TICKET_PRIORITIES = ['low', 'normal', 'high', 'urgent'] as const
export type TicketPriority = (typeof TICKET_PRIORITIES)[number]

export const TICKET_STATUS_LABELS: Record<TicketStatus, string> = {
  open: '未対応',
  in_progress: '対応中',
  resolved: '解決済',
  closed: 'クローズ',
}

export const TICKET_PRIORITY_LABELS: Record<TicketPriority, string> = {
  low: '低',
  normal: '通常',
  high: '高',
  urgent: '緊急',
}
