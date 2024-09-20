import { api } from '@/lib/axios'
import { ISource } from '@/types/modules/source'
import { IPaginatedParams } from '@/types/paginatedParams'
import { IPaginatedResponse } from '@/types/paginatedResponse'

export interface IGetSourceParams extends IPaginatedParams {
  search?: string
  clientId: string
}

export async function getSources(params: IGetSourceParams) {
  const { data } = await api.get<IPaginatedResponse<ISource[]>>(`/sources`, {
    params
  })
  return data
}
