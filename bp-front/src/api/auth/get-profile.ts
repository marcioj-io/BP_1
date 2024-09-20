import { api } from '@/lib/axios'
import { IAuthUser } from '@/types'

export async function getProfile(accessToken: string) {
  const { data } = await api.get<IAuthUser>('/auth/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  return data
}
