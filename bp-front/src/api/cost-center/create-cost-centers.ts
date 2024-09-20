import { api } from '@/lib/axios'

export interface ICreateCostCenterBody {
  name: string
  description: string
  status: string
}

export async function createCostCenters(
  body: ICreateCostCenterBody,
  clientId: string
): Promise<string> {
  const { data } = await api.post<string>(
    `/clients/${clientId}/cost-centers`,
    body
  )
  return data
}
