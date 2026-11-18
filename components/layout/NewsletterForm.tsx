'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '@/components/ui/Button'
import { inputClass } from '@/components/ui/Field'
import { footer } from '@/content/layout'
import { toast } from '@/lib/stores/toast'
import { cn } from '@/lib/utils'

const t = footer.newsletter

export const newsletterSchema = z.object({
  email: z.string().trim().min(1, t.errors.required).pipe(z.email(t.errors.invalid)),
})
type Values = z.infer<typeof newsletterSchema>

/** Mock submit for now. Phase 2: Shopify customer marketing consent (or ESP) via Server Action. */
export function NewsletterForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<Values>({ resolver: zodResolver(newsletterSchema), defaultValues: { email: '' } })

  const onSubmit = async () => {
    await new Promise((r) => setTimeout(r, 400))
    reset({ email: '' }, { keepIsSubmitSuccessful: true })
    toast({ title: t.success, tone: 'success' })
  }

  const error = errors.email?.message
  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-1.5">
      <label htmlFor="newsletter-email" className="sr-only">
        {t.label}
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder={t.placeholder}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'newsletter-error' : isSubmitSuccessful ? 'newsletter-success' : undefined}
          className={cn(inputClass, 'flex-1')}
          {...register('email')}
        />
        <Button type="submit" disabled={isSubmitting}>
          {t.submit}
        </Button>
      </div>
      <p id="newsletter-error" className={cn('min-h-5 text-xs', error ? 'text-danger' : 'text-success')} aria-live="polite">
        {error ?? (isSubmitSuccessful ? <span id="newsletter-success">{t.success}</span> : null)}
      </p>
    </form>
  )
}
