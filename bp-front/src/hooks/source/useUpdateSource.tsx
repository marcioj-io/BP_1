import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateSources } from '@/api/source/update-source'
import { ISourceBody } from '@/types'

import { SOURCE_QUERY_KEY } from './useGetSourceById'
import { SourceQueryKey } from './useSearchParams'

interface MutationArgs {
  body: ISourceBody
  sourceId: string
}

export const useUpdateSource = () => {
  const queryClient = useQueryClient()

  return useMutation<string, Error, MutationArgs>({
    mutationFn: ({ body, sourceId }: MutationArgs) =>
      updateSources(body, sourceId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [SourceQueryKey.SOURCE]
      })

      queryClient.invalidateQueries({
        queryKey: [SOURCE_QUERY_KEY, variables.sourceId]
      })
    }
  })
}
