import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteSourceById } from '@/api/source/delete-source'

import { SourceQueryKey } from './useSearchParams'

interface MutationArgs {
  sourceId: string
  onSuccess?: () => void
  version: number
}

export const useDeleteSource = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, MutationArgs>({
    mutationFn: ({ sourceId, version }: MutationArgs) =>
      deleteSourceById({ sourceId, version }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SourceQueryKey.SOURCE]
      })
    }
  })
}
