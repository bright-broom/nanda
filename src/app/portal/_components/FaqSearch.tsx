'use client'

import { useState } from 'react'
import { trpc } from '@/trpc/react'

export function FaqSearch() {
  const [query, setQuery] = useState('')
  const { data, isFetching } = trpc.faq.search.useQuery({ query })

  return (
    <div>
      <input
        type="search"
        placeholder="キーワードで検索（例: パスワード、料金）"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm focus:border-zinc-500 focus:outline-none"
      />
      <ul className="mt-4 space-y-2">
        {isFetching && data === undefined ? (
          <li className="text-sm text-zinc-500">読み込み中...</li>
        ) : data && data.length > 0 ? (
          data.map((faq) => (
            <li key={faq.id} className="rounded-md border border-zinc-200 bg-white p-4">
              <details>
                <summary className="cursor-pointer font-medium">{faq.question}</summary>
                <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-700">{faq.answer}</p>
              </details>
            </li>
          ))
        ) : (
          <li className="text-sm text-zinc-500">該当する質問が見つかりませんでした。</li>
        )}
      </ul>
    </div>
  )
}
