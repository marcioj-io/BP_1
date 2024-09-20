import { api } from '@/lib/axios'
import { store } from '@/lib/jotai'
import { authAtom } from '@/store/user'

export interface IUpdateProfilePassword {
  actualPassword: string
  newPassword: string
}

export async function updatePassword(
  body: IUpdateProfilePassword
): Promise<void> {
  const auth = store.get(authAtom)

  const { data } = await api.patch('/user/personal/password', {
    ...body,
    version: auth?.user?.version
  })
  return data
}
