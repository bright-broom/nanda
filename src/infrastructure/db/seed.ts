import 'dotenv/config'
import { db } from './client'
import { faqs, flows, tenants } from './schema'
import type { FlowDefinition } from '@/domain/flow/entity'

const envTenantId = process.env.DEFAULT_TENANT_ID
if (!envTenantId) {
  throw new Error('DEFAULT_TENANT_ID is required for seeding')
}
const DEFAULT_TENANT_ID: string = envTenantId

const sampleFlow: FlowDefinition = {
  nodes: [
    { id: 'start', type: 'START' },
    {
      id: 'q-category',
      type: 'QUESTION',
      text: 'お問い合わせの種類を選択してください',
      options: [
        { label: '請求・料金について', value: 'billing' },
        { label: '技術的な問題', value: 'tech' },
        { label: 'その他', value: 'other' },
      ],
    },
    {
      id: 'form-main',
      type: 'FORM',
      fields: [
        { name: 'subject', label: '件名', type: 'text', required: true },
        { name: 'body', label: '詳細内容', type: 'textarea', required: true },
        { name: 'senderName', label: 'お名前（任意）', type: 'text', required: false },
        { name: 'senderEmail', label: 'メールアドレス', type: 'email', required: true },
      ],
    },
    { id: 'create-ticket', type: 'TICKET_CREATE' },
    { id: 'end', type: 'END', message: 'お問い合わせを受け付けました。担当者よりご連絡いたします。' },
  ],
  edges: [
    { from: 'start', to: 'q-category' },
    { from: 'q-category', to: 'form-main' },
    { from: 'form-main', to: 'create-ticket' },
    { from: 'create-ticket', to: 'end' },
  ],
}

async function main() {
  console.log('Seeding tenant...')
  await db
    .insert(tenants)
    .values({
      id: DEFAULT_TENANT_ID,
      name: 'Default Tenant',
      slug: 'default',
      notifyEmail: process.env.SEED_NOTIFY_EMAIL ?? 'ops@example.com',
    })
    .onConflictDoNothing()

  console.log('Seeding FAQs...')
  await db
    .insert(faqs)
    .values([
      {
        tenantId: DEFAULT_TENANT_ID,
        question: '料金プランを変更したい',
        answer: 'マイページ → 設定 → プラン変更から手続きできます。',
        keywords: ['料金', 'プラン', '変更', '価格'],
        category: 'billing',
        order: 1,
      },
      {
        tenantId: DEFAULT_TENANT_ID,
        question: 'パスワードを忘れた',
        answer: 'ログイン画面の「パスワードを忘れた方」から再設定してください。',
        keywords: ['パスワード', '忘れた', 'リセット', 'ログイン'],
        category: 'account',
        order: 2,
      },
      {
        tenantId: DEFAULT_TENANT_ID,
        question: '請求書のダウンロード方法',
        answer: 'マイページ → 請求履歴から月毎のPDFをダウンロードできます。',
        keywords: ['請求書', 'PDF', 'ダウンロード', '領収書'],
        category: 'billing',
        order: 3,
      },
    ])
    .onConflictDoNothing()

  console.log('Seeding flow...')
  await db
    .insert(flows)
    .values({
      tenantId: DEFAULT_TENANT_ID,
      name: '標準フロー',
      definition: sampleFlow,
      isActive: true,
    })
    .onConflictDoNothing()

  console.log('Seed completed.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
