import { useQuery } from '@tanstack/react-query'

import { getCostCenterById } from '@/api/cost-center/get-cost-center-by-id'

interface MutationArgs {
  costCenterId: string
  clientId: string
}

export const COST_CENTER_BY_ID_QUERY_KEY = 'cost-center'

export const useGetByIdCostCenter = (params: MutationArgs) => {
  return useQuery({
    queryKey: [COST_CENTER_BY_ID_QUERY_KEY, params],
    queryFn: () => getCostCenterById(params),
    enabled: !!params.costCenterId
  })
}
