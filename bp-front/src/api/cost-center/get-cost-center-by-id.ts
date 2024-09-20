import { api } from '@/lib/axios'
import { ICostCenter } from '@/types'

export async function getCostCenterById(params: {
  clientId: string
  costCenterId: string
}) {
  const { data } = await api.get<ICostCenter>(
    `/clients/${params.clientId}/cost-centers/${params.costCenterId}`
  )
  return data
}
