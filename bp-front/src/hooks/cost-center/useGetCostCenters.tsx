import { useQuery } from '@tanstack/react-query'

import {
  getCostCenters,
  IGetCostCenterParameters
} from '@/api/cost-center/get-cost-centers'

export const COST_CENTERS = 'cost-centers'

export const useGetCostCenters = (params: IGetCostCenterParameters) => {
  return useQuery({
    queryKey: [COST_CENTERS, params],
    queryFn: () => getCostCenters(params),
    enabled: !!params.clientId
  })
}
