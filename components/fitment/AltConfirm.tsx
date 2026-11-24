'use client'

import { Camera, Hash, LoaderCircle, ScanLine } from 'lucide-react'
import { Tabs } from 'radix-ui'
import { useEffect, useId, useState, useTransition } from 'react'
import { lookupVin } from '@/app/fitment/actions'
import { buttonVariants } from '@/components/ui/button-variants'
import { inputClass } from '@/components/ui/Field'
import { finder } from '@/content/fitment'
import type { Housing } from '@/lib/commerce/types'
import { cx } from '@/lib/cx'
import { findByPartNumber, MIN_PART_QUERY } from '@/lib/fitment'

const t = finder.alt

type Props = {
  housings: Housing[]
  onPartMatch: (code: string, exact: boolean) => void
  onVinMatch: (match: { year: number; make: string; model: string }) => void
  onPhotoSent: () => void
}

const tabTrigger = cx(
  'inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-md px-2 text-sm whitespace-nowrap text-muted transition-colors duration-fast',
  'hover:text-fg data-[state=active]:bg-surface-2 data-[state=active]:text-fg',
)

/** Part number, VIN and photo review: the ways to confirm fit when the dropdowns aren't enough. */
export function AltConfirm({ housings, onPartMatch, onVinMatch, onPhotoSent }: Props) {
  return (
    <section
      id="confirm-other"
      aria-labelledby="confirm-other-title"
      className="scroll-mt-24 rounded-xl border border-line bg-surface p-4 sm:p-5"
    >
      <h2 id="confirm-other-title" className="font-semibold tracking-tight">
        {t.title}
      </h2>
      <p className="mt-0.5 text-sm text-subtle">{t.subtitle}</p>
      <Tabs.Root defaultValue="part" className="mt-4">
        <Tabs.List
          aria-label={t.title}
          className="flex gap-1 rounded-lg border border-line bg-bg p-1"
        >
          <Tabs.Trigger value="part" className={tabTrigger}>
            <Hash aria-hidden className="size-4" />
            {t.tabs.part}
          </Tabs.Trigger>
          <Tabs.Trigger value="vin" className={tabTrigger}>
            <ScanLine aria-hidden className="size-4" />
            {t.tabs.vin}
          </Tabs.Trigger>
          <Tabs.Trigger value="photo" className={tabTrigger}>
            <Camera aria-hidden className="size-4" />
            {t.tabs.photo}
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="part" className="pt-4">
          <PartNumberSearch housings={housings} onPick={onPartMatch} />
        </Tabs.Content>
        <Tabs.Content value="vin" className="pt-4">
          <VinLookup onMatch={onVinMatch} />
        </Tabs.Content>
        <Tabs.Content value="photo" className="pt-4">
          <PhotoReview onSent={onPhotoSent} />
        </Tabs.Content>
      </Tabs.Root>
    </section>
  )
}

function PartNumberSearch({
  housings,
  onPick,
}: {
  housings: Housing[]
  onPick: (code: string, exact: boolean) => void
}) {
  const id = useId()
  const [q, setQ] = useState('')
  const typed = q.replace(/[^a-z0-9]/gi, '').length
  const matches = typed >= 2 ? findByPartNumber(housings, q) : []
  const status =
    typed === 0 ? '' : matches.length ? '' : typed < MIN_PART_QUERY ? t.part.tooShort : t.part.none
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {t.part.label}
      </label>
      <input
        id={id}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.part.placeholder}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={`${id}-help ${id}-status`}
        className={cx(inputClass, 'mt-1.5 font-mono uppercase placeholder:normal-case')}
      />
      <p id={`${id}-help`} className="mt-1.5 text-xs text-subtle">
        {t.part.help}
      </p>
      <p id={`${id}-status`} aria-live="polite" className="mt-2 min-h-5 text-sm text-muted">
        {status}
      </p>
      {matches.length ? (
        <ul className="mt-3 grid gap-2">
          {matches.map((m) => (
            <li
              key={m.housing.code}
              className="flex items-center justify-between gap-3 rounded-md border border-line bg-bg p-3"
            >
              <span className="min-w-0">
                <span className="block truncate font-mono text-sm">{m.partNumber}</span>
                <span className="block text-xs text-subtle">
                  {m.exact ? t.part.exact : t.part.prefix} · {m.housing.name}
                </span>
              </span>
              <button
                type="button"
                onClick={() => onPick(m.housing.code, m.exact)}
                className={buttonVariants({ size: 'sm', variant: 'secondary' })}
              >
                {t.part.use}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  )
}

function VinLookup({
  onMatch,
}: {
  onMatch: (m: { year: number; make: string; model: string }) => void
}) {
  const id = useId()
  const [vin, setVin] = useState('')
  const [message, setMessage] = useState<{ tone: 'error' | 'ok'; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    setMessage(null)
    startTransition(async () => {
      const res = await lookupVin(vin)
      if (!res.ok) {
        setMessage({ tone: 'error', text: t.vin.errors[res.error] })
        return
      }
      const label = [res.vehicle.year, res.vehicle.make, res.vehicle.model].join(' ')
      if (res.match) {
        setMessage({ tone: 'ok', text: t.vin.found(label) })
        onMatch(res.match)
      } else {
        setMessage({ tone: 'error', text: t.vin.notListed(label) })
      }
    })
  }

  return (
    <form onSubmit={submit} noValidate>
      <label htmlFor={id} className="text-sm font-medium">
        {t.vin.label}
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={id}
          value={vin}
          onChange={(e) => setVin(e.target.value)}
          placeholder={t.vin.placeholder}
          autoComplete="off"
          spellCheck={false}
          maxLength={24}
          aria-invalid={message?.tone === 'error' ? true : undefined}
          aria-describedby={`${id}-help ${id}-msg`}
          className={cx(inputClass, 'font-mono uppercase')}
        />
        <button
          type="submit"
          disabled={pending || vin.trim().length === 0}
          className={buttonVariants()}
        >
          {pending ? <LoaderCircle aria-hidden className="motion-safe:animate-spin" /> : null}
          {pending ? t.vin.checking : t.vin.submit}
        </button>
      </div>
      <p id={`${id}-help`} className="mt-1.5 text-xs text-subtle">
        {t.vin.help}
      </p>
      <p
        id={`${id}-msg`}
        aria-live="polite"
        className={cx(
          'mt-2 min-h-5 text-sm',
          message?.tone === 'error' ? 'text-danger' : 'text-success',
        )}
      >
        {message?.text}
      </p>
    </form>
  )
}

const MAX_BYTES = 10 * 1024 * 1024
const TYPES = ['image/jpeg', 'image/png', 'image/heic', 'image/heif', 'image/webp']
const EXT = /\.(jpe?g|png|heic|heif|webp)$/i
/** Simple shape check (something@something.tld); the real check is the confirmation email. */
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Some OSes report HEIC with an empty type: fall back to the file extension. */
const isImage = (f: File) => TYPES.includes(f.type) || (f.type === '' && EXT.test(f.name))

function PhotoReview({ onSent }: { onSent: () => void }) {
  const id = useId()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [fileError, setFileError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  // Release the object URL when it changes or the form unmounts.
  useEffect(
    () => () => {
      if (preview) URL.revokeObjectURL(preview)
    },
    [preview],
  )

  function pick(f: File | undefined) {
    setFileError(null)
    setPreview(null)
    setFile(null)
    if (!f) return
    if (!isImage(f)) return setFileError(t.photo.wrongType)
    if (f.size > MAX_BYTES) return setFileError(t.photo.tooBig)
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const fileErr = file ? null : t.photo.noFile
    const emailErr = EMAIL.test(email) ? null : t.photo.emailInvalid
    setFileError(fileErr)
    setEmailError(emailErr)
    if (fileErr || emailErr) return
    // Phase 2: upload to storage + create a review ticket. Mock: keep it in the browser.
    setSent(true)
    setPreview(null)
    onSent()
  }

  if (sent) {
    return (
      <p role="status" className="rounded-md border border-success/40 bg-success/5 p-3 text-sm">
        {t.photo.sent}
      </p>
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3">
      <div>
        <label htmlFor={id} className="text-sm font-medium">
          {t.photo.label}
        </label>
        <input
          id={id}
          type="file"
          accept={[...TYPES, '.heic', '.heif'].join(',')}
          aria-invalid={fileError ? true : undefined}
          aria-describedby={`${id}-help ${id}-file-err`}
          onChange={(e) => pick(e.target.files?.[0])}
          className="mt-1.5 block w-full text-sm text-muted file:mr-3 file:h-10 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:text-sm file:text-fg hover:file:bg-line"
        />
        <p id={`${id}-help`} className="mt-1.5 text-xs text-subtle">
          {t.photo.help}
        </p>
        <p id={`${id}-file-err`} aria-live="polite" className="min-h-5 text-sm text-danger">
          {fileError}
        </p>
      </div>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element -- local object URL preview, not a remote image
        <img
          src={preview}
          alt=""
          className="h-32 w-auto rounded-md border border-line object-cover"
        />
      ) : null}
      <div>
        <label htmlFor={`${id}-email`} className="text-sm font-medium">
          {t.photo.email}
        </label>
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          value={email}
          aria-invalid={emailError ? true : undefined}
          aria-describedby={`${id}-email-err`}
          onChange={(e) => setEmail(e.target.value)}
          className={cx(inputClass, 'mt-1.5')}
        />
        <p id={`${id}-email-err`} aria-live="polite" className="min-h-5 text-sm text-danger">
          {emailError}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className={buttonVariants({ variant: 'secondary' })}>
          {t.photo.submit}
        </button>
        <span className="text-xs text-subtle">{t.photo.note}</span>
      </div>
    </form>
  )
}
