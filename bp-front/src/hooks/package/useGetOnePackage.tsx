import { useQuery } from '@tanstack/react-query'

import { getOnePackage } from '@/api/packages/get-one-package'

export const GET_ONE_PACKAGE_KEY = 'package'

export const useGetOnePackage = (packageId: string) => {
  return useQuery({
    queryKey: [GET_ONE_PACKAGE_KEY, packageId],
    queryFn: () => getOnePackage(packageId),
    enabled: !!packageId
  })
}
