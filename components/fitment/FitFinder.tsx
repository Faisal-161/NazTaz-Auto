'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { finder } from '@/content/fitment'
import type { FitMethod, Fitment, Housing, Product } from '@/lib/commerce/types'
import {
  badgeFor,
  housingsOf,
  labelFor,
  resolveFitment,
  rowsFor,
  sameSlug,
  toFitParams,
  trimOptions,
  updateSelection,
  type FitBadge,
  type FitSelection,
} from '@/lib/fitment'
import { useGarageStore } from '@/lib/stores/garage'
import { AltConfirm } from './AltConfirm'
import { FactoryStep } from './FactoryStep'
import { HousingStep } from './HousingStep'
import { ResultStep } from './ResultStep'
import { StepFrame, type StepState } from './StepFrame'
import { TRIM_OTHER, VehicleStep } from './VehicleStep'

type Step = 'factory' | 'vehicle' | 'housing' | 'result'
const ORDER: Step[] = ['factory', 'vehicle', 'housing', 'result']

type Override = {
  housing: string
  method: Extract<FitMethod, 'part_number'>
  exact: boolean
  /** The part number didn't belong to the selected vehicle, so that vehicle was cleared. */
  replacedVehicle: boolean
}

type Props = {
  rows: Fitment[]
  housings: Housing[]
  products: Product[]
  initial: FitSelection
}

/**
 * The fit finder. All decisions come from lib/fitment (resolveFitment); this component only
 * renders the current step, keeps the selection in the URL and saves the result to My Garage.
 */
export function FitFinder({ rows, housings, products, initial }: Props) {
  const [sel, setSel] = useState<FitSelection>(initial)
  const [override, setOverride] = useState<Override | null>(null)
  const addVehicle = useGarageStore((s) => s.addVehicle)

  const resolution = useMemo(() => resolveFitment(rows, sel), [rows, sel])
  const housingByCode = useMemo(() => new Map(housings.map((h) => [h.code, h])), [housings])

  // ----- which step is active -----
  let step: Step
  if (override) step = 'result'
  else if (!sel.factory) step = 'factory'
  else if (resolution.kind === 'universal' || resolution.kind === 'resolved') step = 'result'
  else if (resolution.kind === 'pick_housing') step = 'housing'
  else step = 'vehicle'
  const stepIndex = ORDER.indexOf(step)
  const stateOf = (s: Step): StepState => {
    const i = ORDER.indexOf(s)
    return i < stepIndex ? 'done' : i === stepIndex ? 'active' : 'upcoming'
  }

  // ----- labels -----
  const vehicleComplete = sel.year !== undefined && !!sel.make && !!sel.model
  const trimLabel =
    vehicleComplete && sel.trim && sel.trim !== TRIM_OTHER
      ? trimOptions(rows, sel.year!, sel.make!, sel.model!).find((o) => o.value === sel.trim)?.label
      : undefined
  const vehicleLabel = vehicleComplete
    ? [sel.year, labelFor(rows, 'make', sel.make!), labelFor(rows, 'model', sel.model!), trimLabel]
        .filter(Boolean)
        .join(' ')
    : null

  // ----- result data -----
  const universalPath = !override && resolution.kind === 'universal'
  const resolvedCode =
    override?.housing ?? (resolution.kind === 'resolved' ? resolution.housing : undefined)
  const housing = resolvedCode ? (housingByCode.get(resolvedCode) ?? null) : null
  let badge: FitBadge | null = null
  if (
    resolution.kind === 'resolved' &&
    resolvedCode &&
    sameSlug(resolution.housing, resolvedCode)
  ) {
    badge = badgeFor(resolution.confidence)
  } else if (override) {
    badge = override.exact ? 'likely' : 'check'
  }
  const fitting = housing
    ? products.filter(
        (p) =>
          p.productType === 'vehicle' && p.housing_code && sameSlug(p.housing_code, housing.code),
      )
    : []
  const universal = products.filter((p) => p.productType === 'universal')
  const savedToGarage = step === 'result' && vehicleComplete && !!(housing || universalPath)

  // ----- keep the URL in sync for sharing and reloads (replaceState: Back leaves the finder) -----
  useEffect(() => {
    const qs = toFitParams(sel)
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname)
  }, [sel])

  // ----- save to My Garage when a vehicle result is reached -----
  const garageKey = savedToGarage
    ? [
        sel.year,
        sel.make,
        sel.model,
        sel.generation,
        sel.trim,
        housing?.code ?? 'universal',
        override?.method,
      ].join('|')
    : ''
  useEffect(() => {
    if (!garageKey || !vehicleComplete) return
    const generation = sel.generation ? labelFor(rows, 'generation', sel.generation) : undefined
    addVehicle({
      year: sel.year!,
      make: labelFor(rows, 'make', sel.make!),
      model: labelFor(rows, 'model', sel.model!),
      ...(generation ? { generation } : {}),
      ...(trimLabel ? { trim: trimLabel } : {}),
      ...(housing
        ? { housing_code: housing.code, fit_method: override?.method ?? 'picker' }
        : { fit_method: 'universal' as const }),
    })
    // garageKey captures every input; re-running on label identity would loop.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [garageKey])

  // ----- move focus to the new step's heading (keyboard + screen readers) -----
  const headings = useRef<Partial<Record<Step, HTMLHeadingElement | null>>>({})
  const firstRender = useRef(true)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headings.current[step]?.focus({ preventScroll: false })
  }, [step])

  // ----- actions -----
  const patch = (p: Partial<FitSelection>) => {
    setOverride(null)
    setSel((s) => updateSelection(s, p))
  }
  const onPartMatch = (code: string, exact: boolean) => {
    // A part number that doesn't belong to the selected vehicle wins, but must never be saved to
    // the garage under that vehicle: clear the vehicle and tell the shopper why.
    const candidates = vehicleComplete
      ? housingsOf(rowsFor(rows, sel.year!, sel.make!, sel.model!))
      : []
    const replacedVehicle = vehicleComplete && !candidates.some((c) => sameSlug(c, code))
    if (replacedVehicle) setSel((cur) => ({ factory: cur.factory ?? 'yes' }))
    setOverride({ housing: code, method: 'part_number', exact, replacedVehicle })
  }
  const housingEditable =
    !override && resolveFitment(rows, { ...sel, housing: undefined }).kind === 'pick_housing'

  const factoryLabel = sel.factory ? finder.factory.options[sel.factory].label : undefined
  const s = finder.steps

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
      <div>
        <StepFrame
          id="step-factory"
          n={s.factory.n}
          title={s.factory.title}
          state={stateOf('factory')}
          summary={factoryLabel}
          onEdit={() => patch({ factory: undefined })}
          headingRef={(el) => {
            headings.current.factory = el
          }}
        >
          <FactoryStep value={sel.factory} onChange={(factory) => patch({ factory })} />
        </StepFrame>

        <StepFrame
          id="step-vehicle"
          n={s.vehicle.n}
          title={s.vehicle.title}
          state={stateOf('vehicle')}
          summary={vehicleLabel ?? (universalPath ? s.vehicle.skipped : s.vehicle.summaryEmpty)}
          onEdit={vehicleComplete ? () => patch({ model: undefined }) : undefined}
          headingRef={(el) => {
            headings.current.vehicle = el
          }}
        >
          <VehicleStep rows={rows} sel={sel} resolution={resolution} onPatch={patch} />
        </StepFrame>

        <StepFrame
          id="step-housing"
          n={s.housing.n}
          title={s.housing.title}
          state={stateOf('housing')}
          summary={
            housing ? (
              <>
                <span className="font-mono text-fg">{housing.code}</span>
                <span className="text-subtle"> · {housing.name}</span>
              </>
            ) : universalPath ? (
              s.housing.skipped
            ) : (
              s.housing.summaryEmpty
            )
          }
          onEdit={housingEditable ? () => patch({ housing: undefined }) : undefined}
          headingRef={(el) => {
            headings.current.housing = el
          }}
        >
          {resolution.kind === 'pick_housing' ? (
            <HousingStep
              housings={resolution.housings
                .map((c) => housingByCode.get(c))
                .filter((h): h is Housing => !!h)}
              value={sel.housing}
              onChange={(code) => patch({ housing: code })}
            />
          ) : null}
        </StepFrame>

        <StepFrame
          id="step-result"
          n={s.result.n}
          title={s.result.title}
          state={stateOf('result')}
          last
          headingRef={(el) => {
            headings.current.result = el
          }}
        >
          <ResultStep
            vehicleLabel={vehicleLabel}
            housing={housing}
            badge={badge}
            savedToGarage={savedToGarage}
            fitting={fitting}
            universal={universal}
            universalReason={resolution.kind === 'universal' ? resolution.reason : undefined}
            note={override?.replacedVehicle ? finder.result.partReplacedVehicle : undefined}
            onRestart={() => {
              setOverride(null)
              setSel({})
            }}
          />
        </StepFrame>
      </div>

      <aside className="lg:sticky lg:top-24 lg:self-start">
        <AltConfirm
          housings={housings}
          onPartMatch={onPartMatch}
          onVinMatch={(m) => {
            // A VIN replaces any part-number housing chosen earlier.
            setOverride(null)
            setSel((cur) =>
              updateSelection(cur, {
                factory: cur.factory ?? 'unsure',
                year: m.year,
                make: m.make,
                model: m.model,
              }),
            )
          }}
          onPhotoSent={() => {
            if (vehicleComplete) {
              addVehicle({
                year: sel.year!,
                make: labelFor(rows, 'make', sel.make!),
                model: labelFor(rows, 'model', sel.model!),
                fit_method: 'photo_review',
              })
            }
          }}
        />
      </aside>
    </div>
  )
}
