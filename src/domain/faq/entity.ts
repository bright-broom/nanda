export type Faq = {
  id: string
  tenantId: string
  question: string
  answer: string
  keywords: string[]
  category: string | null
  order: number
  createdAt: Date
  updatedAt: Date
}
