import { useQuery } from '@tanstack/react-query'

import { getCostCenterByClientId } from '@/api/cost-center/get-cost-center-by-client-id'

export const COST_CENTER_BY_CLIENT_ID_KEY = 'cost-center-by-client-id'

export const useGetCostCenterByClientId = (clientId: string) => {
  return useQuery({
    queryKey: [COST_CENTER_BY_CLIENT_ID_KEY, clientId],
    queryFn: () => getCostCenterByClientId(clientId),
    enabled: !!clientId
  })
}
