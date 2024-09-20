import { atomWithStorage } from 'jotai/utils'

import { STORAGE_KEYS } from '@/constants'
import { IAuthUser } from '@/types'

export interface AuthProps {
  token: string | null
  refreshToken: string | null
  user: IAuthUser | null
}

export const authAtom = atomWithStorage<AuthProps | null>(
  STORAGE_KEYS.AUTH_DATA,
  localStorage.getItem(STORAGE_KEYS.AUTH_DATA) as AuthProps | null
)
