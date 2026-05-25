# msgdesk — Message Desk Platform 要件定義書

> Claude Code向け実装ガイド。Single Source of Truth。推測実装禁止。

## 1. 概要

電話受電を代替する **顧客自走型メッセージポータル**。顧客がフォーム/フローで問い合わせを送信し、オペレーターがダッシュボードで管理。

**Phase 1ゴール: 動くMockを最短で完成させる。美しさより動作優先。**

- 顧客向け Portal: FAQ検索 + ガイド付きフロー + フォーム送信
- オペレーター向け Dashboard: チケット管理 + FAQ管理
- 通知: メール（Resend経由、Inngestで非同期）

**Phase 2（スコープ外）**: マルチテナントSaaS化、LINE通知、フロー編集ノーコードUI、課金、分析。

## 2. アーキテクチャ

- `/portal/*` — 顧客向け（認証不要）
- `/dashboard/*` — オペレーター向け（Clerk必須）
- 共通API: tRPC v11
- フロー実行: 純粋関数（`src/domain/flow/runner.ts`） + useReducer。定義はDBに JSONB 保存
- 永続化: Drizzle + Neon (Postgres)
- 非同期: Inngest v4（ticket作成→Resendメール、リトライ3回）

## 3. 技術スタック

| レイヤー | 技術 |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript 5 strict |
| Styling | Tailwind CSS v4（CSS-firstで `@theme` 使用、設定ファイル不要） |
| API | tRPC v11 |
| ORM | Drizzle ORM |
| DB | PostgreSQL (Neon) |
| UI state | Zustand |
| Server state | TanStack Query v5 |
| Form | React Hook Form + Zod |
| Flow Engine | 純粋関数 + useReducer（動的グラフのためXStateは未使用、依存からも除外可） |
| Queue | Inngest |
| Auth | Clerk（dashboardのみ） |
| Mail | Resend + React Email |
| Deploy | Vercel + Neon |

**使わない**: Redux/Context（→Zustand）、Prisma（→Drizzle）、GraphQL（→tRPC）、AI/ベクトル検索（→キーワード検索）。

## 4. ディレクトリ構造

```
src/
├── app/
│   ├── portal/
│   │   ├── page.tsx              # FAQ検索 + フロー入口
│   │   ├── flow/[flowId]/page.tsx
│   │   └── complete/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx            # Clerk認証ガード
│   │   ├── page.tsx              # KPI
│   │   ├── tickets/
│   │   └── faq/
│   ├── api/
│   │   ├── trpc/[trpc]/route.ts
│   │   └── inngest/route.ts
│   └── globals.css               # Tailwind v4 @theme
├── domain/
│   ├── ticket/{entity,values}.ts
│   ├── flow/{entity,runner}.ts   # 純粋関数（next node 評価）
│   └── faq/entity.ts
├── application/
│   ├── ticket/{createTicket,queries,updateStatus}.ts
│   ├── flow/load.ts
│   └── faq/{search,manage}.ts
├── infrastructure/
│   ├── db/
│   │   ├── schema.ts
│   │   ├── client.ts
│   │   ├── seed.ts
│   │   └── migrations/
│   ├── email/
│   │   ├── resend.ts
│   │   └── templates/TicketNotification.tsx
│   └── queue/inngest.ts
├── trpc/
│   ├── init.ts                   # context + procedure factory
│   ├── server.ts                 # ルートルーター
│   ├── react.tsx                 # client provider
│   └── routers/{ticket,flow,faq}.ts
├── lib/tenant.ts                 # DEFAULT_TENANT_ID 取得
└── proxy.ts                      # Clerk（Next 16でmiddleware.tsから改名）
```

## 5. DBスキーマ

`src/infrastructure/db/schema.ts`:

```typescript
import { pgTable, text, timestamp, jsonb, uuid, integer, pgEnum, boolean } from 'drizzle-orm/pg-core'

export const ticketStatusEnum = pgEnum('ticket_status', ['open', 'in_progress', 'resolved', 'closed'])
export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'normal', 'high', 'urgent'])

export const tenants = pgTable('tenants', {
  id:          uuid('id').primaryKey().defaultRandom(),
  name:        text('name').notNull(),
  slug:        text('slug').notNull().unique(),
  notifyEmail: text('notify_email').notNull(),
  createdAt:   timestamp('created_at').defaultNow().notNull(),
})

export const faqs = pgTable('faqs', {
  id:        uuid('id').primaryKey().defaultRandom(),
  tenantId:  uuid('tenant_id').references(() => tenants.id).notNull(),
  question:  text('question').notNull(),
  answer:    text('answer').notNull(),
  keywords:  text('keywords').array().notNull().default([]),
  category:  text('category'),
  order:     integer('order').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const flows = pgTable('flows', {
  id:         uuid('id').primaryKey().defaultRandom(),
  tenantId:   uuid('tenant_id').references(() => tenants.id).notNull(),
  name:       text('name').notNull(),
  definition: jsonb('definition').notNull().$type<FlowDefinition>(),
  isActive:   boolean('is_active').default(true).notNull(),
  createdAt:  timestamp('created_at').defaultNow().notNull(),
  updatedAt:  timestamp('updated_at').defaultNow().notNull(),
})

export const tickets = pgTable('tickets', {
  id:           uuid('id').primaryKey().defaultRandom(),
  tenantId:     uuid('tenant_id').references(() => tenants.id).notNull(),
  flowId:       uuid('flow_id').references(() => flows.id),
  senderEmail:  text('sender_email').notNull(),
  senderName:   text('sender_name'),
  category:     text('category'),
  subject:      text('subject').notNull(),
  body:         text('body').notNull(),
  metadata:     jsonb('metadata').default({}).notNull(),
  status:       ticketStatusEnum('status').default('open').notNull(),
  priority:     ticketPriorityEnum('priority').default('normal').notNull(),
  assignedTo:   text('assigned_to'),
  createdAt:    timestamp('created_at').defaultNow().notNull(),
  updatedAt:    timestamp('updated_at').defaultNow().notNull(),
  resolvedAt:   timestamp('resolved_at'),
})

export const ticketComments = pgTable('ticket_comments', {
  id:        uuid('id').primaryKey().defaultRandom(),
  ticketId:  uuid('ticket_id').references(() => tickets.id).notNull(),
  authorId:  text('author_id').notNull(),
  body:      text('body').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

Phase 1では `tenantId` は環境変数 `DEFAULT_TENANT_ID` 固定参照。

## 6. フロー定義型

`src/domain/flow/entity.ts`:

```typescript
export type NodeId = string

export type FlowNode =
  | { id: NodeId; type: 'START' }
  | { id: NodeId; type: 'QUESTION'; text: string; options: { label: string; value: string }[] }
  | { id: NodeId; type: 'FAQ_DISPLAY'; faqId: string }
  | { id: NodeId; type: 'FORM'; fields: FieldSchema[] }
  | { id: NodeId; type: 'TICKET_CREATE' }
  | { id: NodeId; type: 'END'; message: string }

export type FieldSchema = {
  name: string
  label: string
  type: 'text' | 'textarea' | 'email' | 'select'
  required: boolean
  options?: string[]
}

export type FlowEdge = {
  from: NodeId
  to: NodeId
  condition?: string  // 例: "answer === 'billing'"。未指定は常にtrue
}

export type FlowDefinition = {
  nodes: FlowNode[]
  edges: FlowEdge[]
}
```

## 7. 通知

TICKET_CREATEノード到達時に `inngest.send({ name: 'ticket/created', data })`。

```typescript
// Inngest v4: triggers は options に内包する
export const notifyOnTicketCreated = inngest.createFunction(
  {
    id: 'notify-on-ticket-created',
    triggers: [{ event: 'ticket/created' }],
    retries: 3,
  },
  async ({ event }) => {
    await resend.emails.send({
      from: NOTIFY_FROM,
      to: event.data.notifyEmail,
      subject: `[新着] ${event.data.subject}`,
      react: TicketNotificationEmail(event.data),
    })
  }
)
```

メールテンプレートは React Email で `src/infrastructure/email/templates/TicketNotification.tsx` に配置。

## 8. 認証

| 画面 | 認証 |
|---|---|
| `/portal/*` | 不要（メールはフォーム必須入力） |
| `/dashboard/*` | Clerk必須 |

```typescript
// src/proxy.ts （Next 16でmiddleware.tsから改名された）
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
const isDashboard = createRouteMatcher(['/dashboard(.*)'])
export default clerkMiddleware(async (auth, req) => {
  if (isDashboard(req)) await auth.protect()
})
```

## 9. 実装ステップ（Phase 1）

1. **基盤**: Next.js 16 init / Drizzle+Neon / tRPC / Clerk / Inngest / Resend ✅
2. **DB**: schema.ts → `npm run db:generate && db:migrate` → `db:seed` ✅
3. **Portal**: FAQキーワード検索 → フロー実行 → フォーム → 完了画面 ✅
4. **Ticket + 通知**: tRPC `ticket.create` → Inngest `ticket/created` → Resend送信 ✅
5. **Dashboard**: チケット一覧/詳細/コメント/ステータス更新、FAQ CRUD ✅

## 10. 環境変数

`.env.example` を参照。必須:

```env
DATABASE_URL=                                  # Neon接続文字列
DEFAULT_TENANT_ID=                             # 固定参照するtenantのUUID
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
RESEND_API_KEY=
RESEND_FROM=noreply@msgdesk.app                # 送信元（任意）
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
NEXT_PUBLIC_APP_URL=http://localhost:3000
SEED_NOTIFY_EMAIL=ops@example.com              # シード時の通知先（任意）
```

## 11. スコープ外（Phase 2以降）

マルチテナントUI、LINE通知、フロー編集ノーコードUI、フロー分析、AI/ベクトル検索、音声入力、外部CRM連携、ネイティブモバイル、課金。

## 12. コーディング規約

- `any` 禁止 → `unknown` + 型ガード
- Server Componentがデフォルト。`'use client'` は最小限
- tRPCルーターは application層を呼ぶだけ。ビジネスロジック禁止
- エラーは `TRPCError` に統一（application層も `TRPCError` を throw）
- コメントは **なぜ** を書く。**何を** はコードで表現
- DBに触れる Server Component は `export const dynamic = 'force-dynamic'` を付与（プレレンダ時のDB接続を回避）

## 13. セットアップ手順

```bash
# 1. 依存関係インストール
npm install

# 2. .env.example をコピーして値を埋める
cp .env.example .env.local

# 3. Neonでテナント用UUIDを生成して DEFAULT_TENANT_ID に設定
#    (uuidgen | tr A-Z a-z などで生成可)

# 4. DB マイグレーション + シード
npm run db:migrate
npm run db:seed

# 5. 開発サーバ起動
npm run dev
```

---
*Last updated: 2026-05-25 / Status: Phase 1 Mock 完成（typecheck/build OK・要 .env.local 設定）*
