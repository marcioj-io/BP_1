import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updatePackage } from '@/api/packages/update-package'
import { IUpdatePackageBody } from '@/types/modules/packages'

import { PACKAGES_QUERY_KEY } from './useGetPackages'

interface MutationArgs {
  packageId: string
  body: IUpdatePackageBody
}

export const useUpdatePackage = () => {
  const queryClient = useQueryClient()

  return useMutation<string, Error, MutationArgs>({
    mutationFn: ({ packageId, body }: MutationArgs) =>
      updatePackage(packageId, body),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [PACKAGES_QUERY_KEY]
      })

      queryClient.invalidateQueries({
        queryKey: [PACKAGES_QUERY_KEY, variables.packageId]
      })
    }
  })
}
