'use client'

import Link from 'next/link'
import { trpc } from '@/trpc/react'
import { TICKET_STATUS_LABELS, type TicketStatus } from '@/domain/ticket/values'

export default function TicketListPage() {
  const { data, isLoading } = trpc.ticket.list.useQuery({})

  if (isLoading) return <p className="text-sm text-zinc-500">読み込み中...</p>

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">チケット一覧</h1>
      <div className="overflow-hidden rounded-md border border-zinc-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase text-zinc-500">
            <tr>
              <th className="px-4 py-2">件名</th>
              <th className="px-4 py-2">送信者</th>
              <th className="px-4 py-2">状態</th>
              <th className="px-4 py-2">作成日時</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((t) => (
              <tr key={t.id} className="border-t border-zinc-100 hover:bg-zinc-50">
                <td className="px-4 py-2">
                  <Link
                    href={`/dashboard/tickets/${t.id}`}
                    className="font-medium text-zinc-900 hover:underline"
                  >
                    {t.subject}
                  </Link>
                </td>
                <td className="px-4 py-2 text-zinc-600">{t.senderEmail}</td>
                <td className="px-4 py-2">{TICKET_STATUS_LABELS[t.status as TicketStatus]}</td>
                <td className="px-4 py-2 text-zinc-500">
                  {new Date(t.createdAt).toLocaleString('ja-JP')}
                </td>
              </tr>
            ))}
            {data?.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                  チケットはまだありません
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
