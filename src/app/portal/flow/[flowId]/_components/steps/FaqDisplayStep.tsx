'use client'

export function FaqDisplayStep({
  faqId,
  onContinue,
}: {
  faqId: string
  onContinue: () => void
}) {
  return (
    <div className="rounded-md border border-zinc-200 bg-white p-6">
      <p className="text-sm text-zinc-700">FAQ ID: {faqId} を表示（実装簡略化のため省略）</p>
      <button
        type="button"
        onClick={onContinue}
        className="mt-4 rounded-md bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
      >
        解決しなかった
      </button>
    </div>
  )
}
