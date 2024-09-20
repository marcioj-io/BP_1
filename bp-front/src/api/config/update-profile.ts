import { api } from '@/lib/axios'
import { store } from '@/lib/jotai'
import { authAtom } from '@/store/user'

export interface IUpdateProfileBody {
  name: string
}

export async function updateProfile(body: IUpdateProfileBody): Promise<void> {
  const auth = store.get(authAtom)

  const { data } = await api.patch('/user/personal/data', {
    ...body,
    version: auth?.user?.version
  })
  return data
}
