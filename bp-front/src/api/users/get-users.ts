import { api } from '@/lib/axios'
import { IUser } from '@/types'
import { IPaginatedParams } from '@/types/paginatedParams'
import { IPaginatedResponse } from '@/types/paginatedResponse'

export interface IGetUsersParams extends IPaginatedParams {
  search?: string
}

export async function getUsers(params?: IGetUsersParams) {
  const { data } = await api.get<IPaginatedResponse<IUser[]>>('/user', {
    params: {
      ...params,
      module: 'ADMIN'
    }
  })
  return data
}
