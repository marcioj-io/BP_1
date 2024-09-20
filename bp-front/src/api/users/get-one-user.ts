import { api } from '@/lib/axios'
import { IUser } from '@/types'

export async function getOneUser(id: string) {
  const { data } = await api.get<IUser>(`/user/${id}`, {
    params: {
      module: 'ADMIN'
    }
  })
  return data
}
