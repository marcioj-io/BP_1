import { api } from '@/lib/axios'
import { ICostCenter } from '@/types'
import { StatusEnum } from '@/types/modules/packages'
import { IPaginatedParams } from '@/types/paginatedParams'
import { IPaginatedResponse } from '@/types/paginatedResponse'

import { IGetCostCenterByClientIdResponse } from './get-cost-center-by-client-id'

export interface IGetCostCenterParams extends IPaginatedParams {
  search?: string
  clientId: string
}

export interface IGetCostCenterParameters {
  search?: string
  status?: StatusEnum
  clientId: string
}

export async function getCostCenters(
  params: IGetCostCenterParams | IGetCostCenterParameters
) {
  const { data } = await api.get<
    IPaginatedResponse<ICostCenter[]> | IGetCostCenterByClientIdResponse
  >(`/clients/${params?.clientId}/cost-centers`, {
    params
  })
  return data
}
