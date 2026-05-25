export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { loadActiveFlow } from '@/application/flow/load'
import { getDefaultTenantId } from '@/lib/tenant'
import { FaqSearch } from './_components/FaqSearch'

export default async function PortalPage() {
  const tenantId = getDefaultTenantId()
  const flow = await loadActiveFlow(tenantId)

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">お問い合わせ</h1>
        <p className="mt-2 text-sm text-zinc-600">
          まずはよくある質問をご確認ください。解決しない場合はフォームから送信できます。
        </p>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold">よくある質問</h2>
        <FaqSearch />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">お問い合わせフォーム</h2>
        <Link
          href={`/portal/flow/${flow.id}`}
          className="inline-flex items-center rounded-md bg-zinc-900 px-5 py-3 text-sm font-medium text-white hover:bg-zinc-800"
        >
          フォームを開く →
        </Link>
      </section>
    </div>
  )
}
