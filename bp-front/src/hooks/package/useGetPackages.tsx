import { useQuery } from '@tanstack/react-query'

import { getPackages, IGetPackagesParams } from '@/api/packages/get-packages'

export const PACKAGES_QUERY_KEY = 'packages'

export const useGetPackages = (params: IGetPackagesParams) => {
  const { data, isPending } = useQuery({
    queryKey: [PACKAGES_QUERY_KEY, params],
    queryFn: () => getPackages(params)
  })

  const hasNextPage = !!data?.meta.next

  return { data, isPending, hasNextPage }
}
