export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { loadFlow } from '@/application/flow/load'
import { isFlowDefinition } from '@/domain/flow/entity'
import { getDefaultTenantId } from '@/lib/tenant'
import { FlowRunner } from './_components/FlowRunner'

export default async function FlowPage({ params }: { params: Promise<{ flowId: string }> }) {
  const { flowId } = await params
  const tenantId = getDefaultTenantId()
  const flow = await loadFlow({ tenantId, id: flowId })

  if (!isFlowDefinition(flow.definition)) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-6">
        <h1 className="text-xl font-bold">{flow.name}</h1>
      </header>
      <FlowRunner flowId={flow.id} definition={flow.definition} />
    </div>
  )
}
