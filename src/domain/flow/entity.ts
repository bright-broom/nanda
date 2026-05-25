export type NodeId = string

export type FieldSchema = {
  name: string
  label: string
  type: 'text' | 'textarea' | 'email' | 'select'
  required: boolean
  options?: string[]
}

export type FlowNode =
  | { id: NodeId; type: 'START' }
  | { id: NodeId; type: 'QUESTION'; text: string; options: { label: string; value: string }[] }
  | { id: NodeId; type: 'FAQ_DISPLAY'; faqId: string }
  | { id: NodeId; type: 'FORM'; fields: FieldSchema[] }
  | { id: NodeId; type: 'TICKET_CREATE' }
  | { id: NodeId; type: 'END'; message: string }

export type FlowEdge = {
  from: NodeId
  to: NodeId
  condition?: string
}

export type FlowDefinition = {
  nodes: FlowNode[]
  edges: FlowEdge[]
}

export const isFlowDefinition = (value: unknown): value is FlowDefinition => {
  if (typeof value !== 'object' || value === null) return false
  const v = value as Record<string, unknown>
  return Array.isArray(v.nodes) && Array.isArray(v.edges)
}
