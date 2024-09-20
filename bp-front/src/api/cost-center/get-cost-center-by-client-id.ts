import { api } from '@/lib/axios'
import { ICostCenter } from '@/types/modules/cost-center'
import { IPaginatedResponse } from '@/types/paginatedResponse'

export interface IGetCostCenterByClientIdResponse
  extends IPaginatedResponse<ICostCenter[]> {
  data: ICostCenter[]
}

export async function getCostCenterByClientId(clientId: string) {
  const { data } = await api.get<IGetCostCenterByClientIdResponse>(
    `/clients/${clientId}/cost-centers`
  )
  return data
}
