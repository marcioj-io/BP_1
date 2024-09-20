import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteCostCenterById } from '@/api/cost-center/delete-cost-centers'

import { CostCentersQueryKey } from './useSearchParams'

interface MutationArgs {
  costCenterId: string
  clientId: string
  onSuccess?: () => void
  version: number
}

export const useDeleteCostCenter = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, MutationArgs>({
    mutationFn: ({ costCenterId, clientId, version }: MutationArgs) =>
      deleteCostCenterById({ costCenterId, clientId, version }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CostCentersQueryKey.COST_CENTERS]
      })
    }
  })
}
