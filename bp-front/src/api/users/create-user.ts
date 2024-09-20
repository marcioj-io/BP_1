import { api } from '@/lib/axios'
import { ICreateUserBody } from '@/types/modules/users/ICreateUserBody'

export async function createUser(body: ICreateUserBody) {
  const { data } = await api.post('/user', body, {
    params: {
      module: 'ADMIN'
    }
  })

  return data
}
