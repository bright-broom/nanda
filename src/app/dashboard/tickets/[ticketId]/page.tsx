'use client'

import { use, useState } from 'react'
import { trpc } from '@/trpc/react'
import {
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  type TicketStatus,
} from '@/domain/ticket/values'

export default function TicketDetailPage({
  params,
}: {
  params: Promise<{ ticketId: string }>
}) {
  const { ticketId } = use(params)
  const utils = trpc.useUtils()
  const { data, isLoading } = trpc.ticket.byId.useQuery({ id: ticketId })
  const updateStatus = trpc.ticket.updateStatus.useMutation({
    onSuccess: () => utils.ticket.byId.invalidate({ id: ticketId }),
  })
  const addComment = trpc.ticket.addComment.useMutation({
    onSuccess: () => {
      utils.ticket.byId.invalidate({ id: ticketId })
      setComment('')
    },
  })
  const [comment, setComment] = useState('')

  if (isLoading || !data) return <p className="text-sm text-zinc-500">読み込み中...</p>

  const { ticket, comments } = data

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <section className="lg:col-span-2 space-y-4">
        <div className="rounded-md border border-zinc-200 bg-white p-6">
          <h1 className="text-xl font-bold">{ticket.subject}</h1>
          <p className="mt-2 text-xs text-zinc-500">
            {ticket.senderName ?? '(匿名)'} &lt;{ticket.senderEmail}&gt; ·{' '}
            {new Date(ticket.createdAt).toLocaleString('ja-JP')}
          </p>
          <pre className="mt-4 whitespace-pre-wrap text-sm text-zinc-800">{ticket.body}</pre>
        </div>

        <div className="rounded-md border border-zinc-200 bg-white p-6">
          <h2 className="mb-3 font-semibold">対応メモ</h2>
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="rounded border border-zinc-100 bg-zinc-50 p-3">
                <p className="text-xs text-zinc-500">
                  {c.authorId} · {new Date(c.createdAt).toLocaleString('ja-JP')}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{c.body}</p>
              </li>
            ))}
            {comments.length === 0 && <li className="text-sm text-zinc-500">コメントはまだありません</li>}
          </ul>

          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (!comment.trim()) return
              addComment.mutate({ ticketId, body: comment })
            }}
            className="mt-4"
          >
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="対応メモを書く..."
              className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={addComment.isPending}
              className="mt-2 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              追加
            </button>
          </form>
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-md border border-zinc-200 bg-white p-4">
          <p className="text-xs font-medium text-zinc-500">ステータス</p>
          <select
            value={ticket.status}
            onChange={(e) =>
              updateStatus.mutate({ id: ticketId, status: e.target.value as TicketStatus })
            }
            className="mt-2 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          >
            {TICKET_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TICKET_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="rounded-md border border-zinc-200 bg-white p-4 text-sm">
          <p className="text-xs font-medium text-zinc-500">担当</p>
          <p className="mt-1">{ticket.assignedTo ?? '未割当'}</p>
        </div>
      </aside>
    </div>
  )
}
