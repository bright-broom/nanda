import Link from 'next/link'

export default function CompletePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-bold">送信が完了しました</h1>
      <p className="mt-3 text-sm text-zinc-600">
        お問い合わせを受け付けました。担当者よりご連絡いたします。
      </p>
      <Link
        href="/portal"
        className="mt-8 inline-block rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm hover:bg-zinc-50"
      >
        ポータルに戻る
      </Link>
    </div>
  )
}
