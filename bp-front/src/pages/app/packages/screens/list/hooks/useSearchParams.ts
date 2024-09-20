import { PaginationState, SortingState } from '@tanstack/react-table'
import { useMemo } from 'react'

import { IGetPackagesParams } from '@/api/packages/get-packages'
import { useGetPackages } from '@/hooks/package/useGetPackages'
import { OrderEnum } from '@/types/paginatedParams'

export const usePackagesParams = (
  pagination: PaginationState,
  sorting: SortingState,
  search: string
) => {
  return useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      orderBy: sorting[0]?.id,
      order: sorting[0]?.desc ? OrderEnum.DESC : OrderEnum.ASC,
      search
    }),
    [pagination, sorting, search]
  )
}

export enum PackageQueryKey {
  PACKAGES = 'packages'
}

export const usePackagesFetch = (params: IGetPackagesParams) => {
  const { data, isPending } = useGetPackages(params)

  const hasNextPage = !!data?.meta.next

  return { data, isPending, hasNextPage }
}
