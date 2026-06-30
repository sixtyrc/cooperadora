import { useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import type { Institution } from '../types'
import { InstitutionContext } from './useInstitution'

export function InstitutionProvider({ children }: { children: React.ReactNode }) {
  const [institution, setInstitution] = useState<Institution | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshInstitution = async () => setInstitution(await api.getInstitution())

  useEffect(() => {
    refreshInstitution().finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!institution) return
    document.documentElement.style.setProperty('--color-primary', institution.primary_color)
    document.documentElement.style.setProperty('--color-primary-dark', institution.secondary_color)
    document.title = institution.name
  }, [institution])

  const value = useMemo(
    () => ({ institution, loading, refreshInstitution }),
    [institution, loading],
  )
  return <InstitutionContext.Provider value={value}>{children}</InstitutionContext.Provider>
}
