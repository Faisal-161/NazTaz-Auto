'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { GarageVehicle } from '@/lib/commerce/types'

/** My Garage: several vehicles; the active one filters the whole site. */
type GarageState = {
  vehicles: GarageVehicle[]
  activeId: string | null
  addVehicle: (v: Omit<GarageVehicle, 'id'>) => string
  updateVehicle: (id: string, patch: Partial<Omit<GarageVehicle, 'id'>>) => void
  removeVehicle: (id: string) => void
  setActive: (id: string | null) => void
}

let vehicleSeq = 0

const keyOf =(v: Pick<GarageVehicle, 'year' | 'make' | 'model' | 'trim'>) =>
  [v.year, v.make, v.model, v.trim ?? ''].join('|').toLowerCase()

export const useGarageStore = create<GarageState>()(
  persist(
    (set, get) => ({
      vehicles: [],
      activeId: null,
      addVehicle: (v) => {
        const dup = get().vehicles.find((x) => keyOf(x) === keyOf(v))
        if (dup) {
          set((s) => ({
            activeId: dup.id,
            vehicles: s.vehicles.map((x) => (x.id === dup.id ? { ...x, ...v } : x)),
          }))
          return dup.id
        }
        const id = `veh_${Date.now().toString(36)}_${(vehicleSeq++).toString(36)}`
        set((s) => ({ vehicles: [...s.vehicles, { ...v, id }], activeId: id }))
        return id
      },
      updateVehicle: (id, patch) =>
        set((s) => ({ vehicles: s.vehicles.map((v) => (v.id === id ? { ...v, ...patch } : v)) })),
      removeVehicle: (id) =>
        set((s) => {
          const vehicles = s.vehicles.filter((v) => v.id !== id)
          return { vehicles, activeId: s.activeId === id ? (vehicles[0]?.id ?? null) : s.activeId }
        }),
      setActive: (activeId) => set({ activeId }),
    }),
    { name: 'store.garage.v1', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
)

export function selectActiveVehicle(s: Pick<GarageState, 'vehicles' | 'activeId'>): GarageVehicle | null {
  return s.vehicles.find((v) => v.id === s.activeId) ?? null
}
