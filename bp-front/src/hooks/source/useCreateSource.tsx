import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createSource } from '@/api/source/create-source'
import { ISourceBody } from '@/types'

import { SourceQueryKey } from './useSearchParams'

interface MutationArgs {
  body: ISourceBody
}

export const useCreateSource = () => {
  const queryClient = useQueryClient()

  return useMutation<string, Error, MutationArgs>({
    mutationFn: ({ body }: MutationArgs) => createSource(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [SourceQueryKey.SOURCE]
      })
    }
  })
}
