'use client'

import { useMemo, useReducer } from 'react'
import { useRouter } from 'next/navigation'
import type { FlowDefinition, FlowNode } from '@/domain/flow/entity'
import { findNode, nextNode, startNode } from '@/domain/flow/runner'
import { trpc } from '@/trpc/react'
import { QuestionStep } from './steps/QuestionStep'
import { FormStep } from './steps/FormStep'
import { FaqDisplayStep } from './steps/FaqDisplayStep'

type RunnerState = {
  currentNodeId: string
  answers: Record<string, unknown>
}

type RunnerEvent =
  | { type: 'ADVANCE'; answers?: Record<string, unknown> }
  | { type: 'GOTO'; nodeId: string; answers?: Record<string, unknown> }

const makeReducer =
  (def: FlowDefinition) =>
  (state: RunnerState, event: RunnerEvent): RunnerState => {
    const mergedAnswers = { ...state.answers, ...(event.answers ?? {}) }
    if (event.type === 'GOTO') {
      return { currentNodeId: event.nodeId, answers: mergedAnswers }
    }
    const next = nextNode(def, state.currentNodeId, mergedAnswers)
    if (!next) return { ...state, answers: mergedAnswers }
    return { currentNodeId: next.id, answers: mergedAnswers }
  }

export function FlowRunner({
  flowId,
  definition,
}: {
  flowId: string
  definition: FlowDefinition
}) {
  const router = useRouter()
  const reducer = useMemo(() => makeReducer(definition), [definition])
  const [state, dispatch] = useReducer(reducer, {
    currentNodeId: startNode(definition).id,
    answers: {},
  })

  const createTicket = trpc.ticket.create.useMutation({
    onSuccess: () => router.push('/portal/complete'),
  })

  const node = findNode(definition, state.currentNodeId)
  if (!node) return <p>無効な状態です</p>

  return <NodeView node={node} state={state} dispatch={dispatch} flowId={flowId} createTicket={createTicket} />
}

function NodeView({
  node,
  state,
  dispatch,
  flowId,
  createTicket,
}: {
  node: FlowNode
  state: RunnerState
  dispatch: React.Dispatch<RunnerEvent>
  flowId: string
  createTicket: ReturnType<typeof trpc.ticket.create.useMutation>
}) {
  if (node.type === 'START') {
    return (
      <div>
        <button
          type="button"
          onClick={() => dispatch({ type: 'ADVANCE' })}
          className="rounded-md bg-zinc-900 px-5 py-2 text-sm text-white hover:bg-zinc-800"
        >
          開始
        </button>
      </div>
    )
  }

  if (node.type === 'QUESTION') {
    return (
      <QuestionStep
        node={node}
        onAnswer={(value) =>
          dispatch({ type: 'ADVANCE', answers: { [node.id]: value, answer: value } })
        }
      />
    )
  }

  if (node.type === 'FAQ_DISPLAY') {
    return (
      <FaqDisplayStep
        faqId={node.faqId}
        onContinue={() => dispatch({ type: 'ADVANCE' })}
      />
    )
  }

  if (node.type === 'FORM') {
    return (
      <FormStep
        fields={node.fields}
        onSubmit={(data) =>
          dispatch({ type: 'ADVANCE', answers: { ...data, formData: data } })
        }
      />
    )
  }

  if (node.type === 'TICKET_CREATE') {
    const answers = state.answers as Record<string, string | undefined>
    const subject = String(answers.subject ?? 'お問い合わせ')
    const body = String(answers.body ?? JSON.stringify(state.answers, null, 2))
    const senderEmail = String(answers.senderEmail ?? '')
    const senderName = answers.senderName ? String(answers.senderName) : null
    const category = answers['q-category'] ? String(answers['q-category']) : null

    if (createTicket.isIdle) {
      createTicket.mutate({
        flowId,
        subject,
        body,
        senderEmail,
        senderName,
        category,
        metadata: state.answers,
      })
    }

    return (
      <div className="rounded-md border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-700">送信中です...</p>
        {createTicket.error && (
          <p className="mt-2 text-sm text-red-600">エラー: {createTicket.error.message}</p>
        )}
      </div>
    )
  }

  if (node.type === 'END') {
    return (
      <div className="rounded-md border border-zinc-200 bg-white p-6">
        <p className="text-sm text-zinc-700">{node.message}</p>
      </div>
    )
  }

  return null
}
