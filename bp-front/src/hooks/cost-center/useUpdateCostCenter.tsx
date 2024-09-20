import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  IUpdateCostCenterBody,
  updateCostCenters
} from '@/api/cost-center/update-cost-centers'

import { COST_CENTER_BY_ID_QUERY_KEY } from './useGetCostCenterById'
import { CostCentersQueryKey } from './useSearchParams'

interface MutationArgs {
  body: IUpdateCostCenterBody
  clientId: string
  costCenterId: string
}

export const useUpdateCostCenter = () => {
  const queryClient = useQueryClient()

  return useMutation<string, Error, MutationArgs>({
    mutationFn: ({ body, clientId, costCenterId }: MutationArgs) =>
      updateCostCenters(body, clientId, costCenterId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [CostCentersQueryKey.COST_CENTERS]
      })
      queryClient.invalidateQueries({
        queryKey: [
          COST_CENTER_BY_ID_QUERY_KEY,
          { costCenterId: variables.costCenterId, clientId: variables.clientId }
        ]
      })
    }
  })
}
