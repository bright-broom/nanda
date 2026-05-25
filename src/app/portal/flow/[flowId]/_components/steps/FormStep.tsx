'use client'

import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import type { FieldSchema } from '@/domain/flow/entity'

const buildSchema = (fields: FieldSchema[]) => {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const field of fields) {
    let s: z.ZodTypeAny
    if (field.type === 'email') s = z.string().email()
    else if (field.type === 'select') s = z.enum(field.options ?? [''] as [string, ...string[]])
    else s = z.string()
    if (field.required) {
      if (s instanceof z.ZodString) s = s.min(1, '必須項目です')
    } else {
      s = s.optional()
    }
    shape[field.name] = s
  }
  return z.object(shape)
}

export function FormStep({
  fields,
  onSubmit,
}: {
  fields: FieldSchema[]
  onSubmit: (data: Record<string, string>) => void
}) {
  const schema = buildSchema(fields)
  type FormValues = Record<string, string | undefined>
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
  })

  return (
    <form
      onSubmit={handleSubmit((data) =>
        onSubmit(Object.fromEntries(Object.entries(data).map(([k, v]) => [k, v ?? ''])) as Record<string, string>),
      )}
      className="space-y-4 rounded-md border border-zinc-200 bg-white p-6"
    >
      {fields.map((field) => (
        <div key={field.name}>
          <label className="block text-sm font-medium text-zinc-800">
            {field.label}
            {field.required && <span className="ml-1 text-red-600">*</span>}
          </label>
          {field.type === 'textarea' ? (
            <textarea
              {...register(field.name)}
              rows={5}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          ) : field.type === 'select' ? (
            <select
              {...register(field.name)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">選択してください</option>
              {field.options?.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              {...register(field.name)}
              className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm"
            />
          )}
          {errors[field.name] && (
            <p className="mt-1 text-xs text-red-600">{String(errors[field.name]?.message)}</p>
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        送信
      </button>
    </form>
  )
}
