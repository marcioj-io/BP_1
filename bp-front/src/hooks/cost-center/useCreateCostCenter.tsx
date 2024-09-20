import { useMutation, useQueryClient } from '@tanstack/react-query'

import {
  createCostCenters,
  ICreateCostCenterBody
} from '@/api/cost-center/create-cost-centers'

import { CostCentersQueryKey } from './useSearchParams'

interface MutationArgs {
  body: ICreateCostCenterBody
  clientId: string
}

export const useCreateCostCenter = () => {
  const queryClient = useQueryClient()

  return useMutation<string, Error, MutationArgs>({
    mutationFn: ({ body, clientId }: MutationArgs) =>
      createCostCenters(body, clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [CostCentersQueryKey.COST_CENTERS]
      })
    }
  })
}
