import { api } from '@/lib/axios'

export async function deleteCostCenterById({
  clientId,
  costCenterId,
  version
}: {
  clientId: string
  costCenterId: string
  version: number
}) {
  const { data } = await api.delete<void>(
    `/clients/${clientId}/cost-centers/${costCenterId}?version=${version}`
  )
  return data
}
