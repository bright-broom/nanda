import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import { TRPCProvider } from '@/trpc/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'msgdesk',
  description: 'Message Desk Platform',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="ja" className="h-full antialiased">
        <body className="min-h-full bg-zinc-50 text-zinc-900">
          <TRPCProvider>{children}</TRPCProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
