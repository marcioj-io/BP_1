import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createPackage } from '@/api/packages/create-package'
import { ICreatePackageBody } from '@/types/modules/packages'

import { PACKAGES_QUERY_KEY } from './useGetPackages'

interface MutationArgs {
  body: ICreatePackageBody
}

export const useCreatePackage = () => {
  const queryClient = useQueryClient()

  return useMutation<string, Error, MutationArgs>({
    mutationFn: ({ body }: MutationArgs) => createPackage(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [PACKAGES_QUERY_KEY]
      })
    }
  })
}
