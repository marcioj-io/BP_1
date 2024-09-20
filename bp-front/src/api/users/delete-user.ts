import { api } from '@/lib/axios'
import { IUser } from '@/types'

export interface IDeleteUserParams {
  id: string
  version: number
}

export async function deleteUser({ id, version }: IDeleteUserParams) {
  const { data } = await api.delete<IUser>(`/user/${id}`, {
    params: {
      module: 'ADMIN',
      version
    }
  })
  return data
}
