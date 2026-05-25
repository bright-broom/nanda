import { serve } from 'inngest/next'
import { inngest } from '@/infrastructure/queue/inngest'
import { functions } from '@/infrastructure/queue/functions'

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions,
})
