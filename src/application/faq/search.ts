import { and, eq, ilike, or, sql } from 'drizzle-orm'
import { db } from '@/infrastructure/db/client'
import { faqs } from '@/infrastructure/db/schema'

export const searchFaqs = async (params: { tenantId: string; query: string }) => {
  const q = params.query.trim()

  if (q.length === 0) {
    return db
      .select()
      .from(faqs)
      .where(eq(faqs.tenantId, params.tenantId))
      .orderBy(faqs.order, faqs.createdAt)
  }

  const like = `%${q}%`
  return db
    .select()
    .from(faqs)
    .where(
      and(
        eq(faqs.tenantId, params.tenantId),
        or(
          ilike(faqs.question, like),
          ilike(faqs.answer, like),
          sql`EXISTS (SELECT 1 FROM unnest(${faqs.keywords}) AS k WHERE k ILIKE ${like})`,
        ),
      ),
    )
    .orderBy(faqs.order, faqs.createdAt)
}

export const listFaqs = async (tenantId: string) =>
  db.select().from(faqs).where(eq(faqs.tenantId, tenantId)).orderBy(faqs.order, faqs.createdAt)
