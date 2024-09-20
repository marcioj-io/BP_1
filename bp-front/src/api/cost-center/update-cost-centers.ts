import { api } from '@/lib/axios'

export interface IUpdateCostCenterBody {
  name: string
  description: string
  status: string
  version: number
}

export async function updateCostCenters(
  body: IUpdateCostCenterBody,
  clientId: string,
  costCenterId: string
): Promise<string> {
  const { data } = await api.put<string>(
    `/clients/${clientId}/cost-centers/${costCenterId}`,
    body
  )
  return data
}
