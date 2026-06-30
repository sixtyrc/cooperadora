import { createContext, useContext } from 'react'
import type { Institution } from '../types'

export const InstitutionContext = createContext({
  institution: null as Institution | null,
  loading: true,
  refreshInstitution: async () => undefined as void,
})

export const useInstitution = () => useContext(InstitutionContext)
