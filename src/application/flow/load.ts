import { and, eq } from 'drizzle-orm'
import { TRPCError } from '@trpc/server'
import { db } from '@/infrastructure/db/client'
import { flows } from '@/infrastructure/db/schema'

export const loadActiveFlow = async (tenantId: string) => {
  const [row] = await db
    .select()
    .from(flows)
    .where(and(eq(flows.tenantId, tenantId), eq(flows.isActive, true)))
    .limit(1)
  if (!row) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'No active flow found' })
  }
  return row
}

export const loadFlow = async (params: { tenantId: string; id: string }) => {
  const [row] = await db
    .select()
    .from(flows)
    .where(and(eq(flows.id, params.id), eq(flows.tenantId, params.tenantId)))
    .limit(1)
  if (!row) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Flow not found' })
  }
  return row
}
