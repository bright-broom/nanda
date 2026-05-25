'use client'

import type { FlowNode } from '@/domain/flow/entity'

type QuestionNode = Extract<FlowNode, { type: 'QUESTION' }>

export function QuestionStep({
  node,
  onAnswer,
}: {
  node: QuestionNode
  onAnswer: (value: string) => void
}) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-6">
      <p className="mb-4 text-base font-medium">{node.text}</p>
      <div className="space-y-2">
        {node.options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onAnswer(opt.value)}
            className="w-full rounded-md border border-zinc-300 px-4 py-2 text-left text-sm hover:bg-zinc-50"
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}
