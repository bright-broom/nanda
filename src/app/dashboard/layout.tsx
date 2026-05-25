import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-zinc-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="text-base font-bold">
              msgdesk
            </Link>
            <nav className="flex gap-4 text-sm text-zinc-600">
              <Link href="/dashboard/tickets">チケット</Link>
              <Link href="/dashboard/faq">FAQ管理</Link>
            </nav>
          </div>
          <UserButton />
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  )
}
