import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ClientProfile } from '../types/studio'
import { readStorage, writeStorage } from '../utils/storage'
import { uid } from '../utils/format'
import { isComplete } from '../utils/studio/validation'

const PROFILES_KEY = 'khoka-tech:studio:profiles:v1'
const THEME_KEY = 'khoka-tech:studio:theme'

interface StudioCtx {
  profiles: ClientProfile[]
  storageOk: boolean
  theme: 'dark' | 'light'
  toggleTheme: () => void
  getProfile: (id: string) => ClientProfile | undefined
  /** inserts or updates; recomputes status and updatedAt; returns the saved profile */
  saveProfile: (p: ClientProfile) => ClientProfile
  deleteProfile: (id: string) => void
  duplicateProfile: (id: string) => ClientProfile | undefined
  /** imports profiles, giving new ids to any that collide; returns imported profiles */
  importProfiles: (list: ClientProfile[]) => ClientProfile[]
}

const Ctx = createContext<StudioCtx | null>(null)

export function StudioProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<ClientProfile[]>(() => readStorage<ClientProfile[]>(PROFILES_KEY, []))
  const [storageOk, setStorageOk] = useState(true)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => readStorage<'dark' | 'light'>(THEME_KEY, 'dark'))

  useEffect(() => {
    setStorageOk(writeStorage(PROFILES_KEY, profiles))
  }, [profiles])
  useEffect(() => {
    writeStorage(THEME_KEY, theme)
  }, [theme])

  // keep multiple open tabs in sync
  useEffect(() => {
    const on = (e: StorageEvent) => {
      if (e.key === PROFILES_KEY) setProfiles(readStorage<ClientProfile[]>(PROFILES_KEY, []))
    }
    window.addEventListener('storage', on)
    return () => window.removeEventListener('storage', on)
  }, [])

  const getProfile = useCallback((id: string) => profiles.find((p) => p.id === id), [profiles])

  const saveProfile = useCallback((p: ClientProfile) => {
    const saved: ClientProfile = { ...p, updatedAt: new Date().toISOString(), status: isComplete(p) ? 'complete' : 'draft' }
    setProfiles((prev) => {
      const exists = prev.some((x) => x.id === saved.id)
      return exists ? prev.map((x) => (x.id === saved.id ? saved : x)) : [saved, ...prev]
    })
    return saved
  }, [])

  const deleteProfile = useCallback((id: string) => setProfiles((prev) => prev.filter((p) => p.id !== id)), [])

  const duplicateProfile = useCallback(
    (id: string) => {
      const src = profiles.find((p) => p.id === id)
      if (!src) return undefined
      const now = new Date().toISOString()
      const copy: ClientProfile = {
        ...structuredClone(src),
        id: uid('client'),
        createdAt: now,
        updatedAt: now,
        brand: { ...src.brand, brandName: `${src.brand.brandName || 'Untitled'} (Copy)` },
        products: src.products.map((pr) => ({ ...pr, id: uid('prod') })),
      }
      copy.status = isComplete(copy) ? 'complete' : 'draft'
      setProfiles((prev) => [copy, ...prev])
      return copy
    },
    [profiles],
  )

  const importProfiles = useCallback(
    (list: ClientProfile[]) => {
      const ids = new Set(profiles.map((p) => p.id))
      const prepared = list.map((p) => {
        if (!ids.has(p.id)) {
          ids.add(p.id)
          return p
        }
        const fresh = { ...p, id: uid('client'), brand: { ...p.brand, brandName: `${p.brand.brandName} (Imported)` } }
        ids.add(fresh.id)
        return fresh
      })
      setProfiles((prev) => [...prepared, ...prev])
      return prepared
    },
    [profiles],
  )

  const value = useMemo<StudioCtx>(
    () => ({
      profiles,
      storageOk,
      theme,
      toggleTheme: () => setTheme((t) => (t === 'dark' ? 'light' : 'dark')),
      getProfile,
      saveProfile,
      deleteProfile,
      duplicateProfile,
      importProfiles,
    }),
    [profiles, storageOk, theme, getProfile, saveProfile, deleteProfile, duplicateProfile, importProfiles],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

/** Studio context if present (null outside the Studio, e.g. in the store Admin). */
export function useOptionalStudio() {
  return useContext(Ctx)
}

export function useStudio() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStudio must be used inside StudioProvider')
  return ctx
}
