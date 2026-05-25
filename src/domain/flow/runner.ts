import type { FlowDefinition, FlowEdge, FlowNode, NodeId } from './entity'

export type FlowAnswers = Record<string, unknown>

export const findNode = (def: FlowDefinition, id: NodeId): FlowNode | undefined =>
  def.nodes.find((n) => n.id === id)

export const startNode = (def: FlowDefinition): FlowNode => {
  const start = def.nodes.find((n) => n.type === 'START')
  if (!start) throw new Error('Flow has no START node')
  return start
}

const evalCondition = (expr: string, answers: FlowAnswers): boolean => {
  try {
    const fn = new Function('answers', `with(answers){ return (${expr}); }`)
    return Boolean(fn(answers))
  } catch {
    return false
  }
}

export const nextNode = (
  def: FlowDefinition,
  currentId: NodeId,
  answers: FlowAnswers,
): FlowNode | null => {
  const outgoing = def.edges.filter((e: FlowEdge) => e.from === currentId)
  for (const edge of outgoing) {
    if (!edge.condition || evalCondition(edge.condition, answers)) {
      const node = findNode(def, edge.to)
      if (node) return node
    }
  }
  return null
}
