import { api } from '@/lib/axios'
import { IEditUserBody } from '@/types/modules/users/IEditUserBody'

export async function editUser(body: IEditUserBody) {
  const { id, ...bodyWithoutId } = body

  const { data } = await api.put(`/user/${id}`, bodyWithoutId, {
    params: {
      module: 'ADMIN'
    }
  })

  return data
}
