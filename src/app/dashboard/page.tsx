export const dynamic = 'force-dynamic'

import { and, count, eq } from 'drizzle-orm'
import { db } from '@/infrastructure/db/client'
import { tickets } from '@/infrastructure/db/schema'
import { getDefaultTenantId } from '@/lib/tenant'
import { TICKET_STATUSES, TICKET_STATUS_LABELS } from '@/domain/ticket/values'

export default async function DashboardHome() {
  const tenantId = getDefaultTenantId()
  const counts = await Promise.all(
    TICKET_STATUSES.map(async (status) => {
      const [{ value }] = await db
        .select({ value: count() })
        .from(tickets)
        .where(and(eq(tickets.tenantId, tenantId), eq(tickets.status, status)))
      return { status, count: value }
    }),
  )

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">ダッシュボード</h1>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {counts.map((c) => (
          <div key={c.status} className="rounded-md border border-zinc-200 bg-white p-4">
            <p className="text-xs text-zinc-500">{TICKET_STATUS_LABELS[c.status]}</p>
            <p className="mt-1 text-2xl font-bold">{c.count}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
