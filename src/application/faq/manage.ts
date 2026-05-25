import { and, eq } from 'drizzle-orm'
import { db } from '@/infrastructure/db/client'
import { faqs } from '@/infrastructure/db/schema'

export type FaqInput = {
  question: string
  answer: string
  keywords: string[]
  category?: string | null
  order?: number
}

export const createFaq = async (params: { tenantId: string; data: FaqInput }) => {
  const [row] = await db
    .insert(faqs)
    .values({
      tenantId: params.tenantId,
      question: params.data.question,
      answer: params.data.answer,
      keywords: params.data.keywords,
      category: params.data.category ?? null,
      order: params.data.order ?? 0,
    })
    .returning()
  return row
}

export const updateFaq = async (params: {
  tenantId: string
  id: string
  data: Partial<FaqInput>
}) => {
  const [row] = await db
    .update(faqs)
    .set({
      ...params.data,
      updatedAt: new Date(),
    })
    .where(and(eq(faqs.id, params.id), eq(faqs.tenantId, params.tenantId)))
    .returning()
  return row
}

export const deleteFaq = async (params: { tenantId: string; id: string }) => {
  await db.delete(faqs).where(and(eq(faqs.id, params.id), eq(faqs.tenantId, params.tenantId)))
}
