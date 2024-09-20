import { api } from '@/lib/axios'
import { IPackages } from '@/types/modules/packages'
import { IPaginatedParams } from '@/types/paginatedParams'
import { IPaginatedResponse } from '@/types/paginatedResponse'

export interface IGetPackagesParams extends IPaginatedParams {
  search: string
}

export async function getPackages(params: IGetPackagesParams) {
  const { data } = await api.get<IPaginatedResponse<IPackages[]>>('/packages', {
    params: {
      ...params
    }
  })
  return data
}
