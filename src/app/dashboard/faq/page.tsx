'use client'

import { useState } from 'react'
import { trpc } from '@/trpc/react'

export default function FaqAdminPage() {
  const utils = trpc.useUtils()
  const { data } = trpc.faq.list.useQuery()
  const createFaq = trpc.faq.create.useMutation({
    onSuccess: () => {
      utils.faq.list.invalidate()
      setForm({ question: '', answer: '', keywords: '', category: '' })
    },
  })
  const deleteFaq = trpc.faq.delete.useMutation({
    onSuccess: () => utils.faq.list.invalidate(),
  })

  const [form, setForm] = useState({ question: '', answer: '', keywords: '', category: '' })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="mb-4 text-2xl font-bold">FAQ管理</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            createFaq.mutate({
              question: form.question,
              answer: form.answer,
              keywords: form.keywords
                .split(',')
                .map((k) => k.trim())
                .filter(Boolean),
              category: form.category || null,
            })
          }}
          className="space-y-3 rounded-md border border-zinc-200 bg-white p-4"
        >
          <input
            placeholder="質問"
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            required
          />
          <textarea
            placeholder="回答"
            value={form.answer}
            onChange={(e) => setForm({ ...form, answer: e.target.value })}
            rows={3}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            required
          />
          <input
            placeholder="キーワード（カンマ区切り）"
            value={form.keywords}
            onChange={(e) => setForm({ ...form, keywords: e.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="カテゴリ（任意）"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={createFaq.isPending}
            className="rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800 disabled:opacity-50"
          >
            追加
          </button>
        </form>
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">登録済みFAQ</h2>
        <ul className="space-y-2">
          {data?.map((faq) => (
            <li key={faq.id} className="rounded-md border border-zinc-200 bg-white p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{faq.question}</p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-700">{faq.answer}</p>
                  <p className="mt-2 text-xs text-zinc-500">
                    キーワード: {faq.keywords.join(', ') || '(なし)'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('削除しますか？')) deleteFaq.mutate({ id: faq.id })
                  }}
                  className="rounded-md border border-red-300 px-3 py-1 text-xs text-red-700 hover:bg-red-50"
                >
                  削除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
