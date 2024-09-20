import { useQuery } from '@tanstack/react-query'
import { PaginationState, SortingState } from '@tanstack/react-table'
import { useMemo } from 'react'

import { getSources, IGetSourceParams } from '@/api/source/get-sources'
import { OrderEnum } from '@/types/paginatedParams'

export enum SourceQueryKey {
  SOURCE = 'sources'
}

export const useSourceSearchParams = (
  pagination: PaginationState,
  sorting: SortingState,
  search: string
) => {
  return useMemo(
    () => ({
      page: pagination.pageIndex + 1,
      perPage: pagination.pageSize,
      orderBy: sorting[0]?.id,
      order: sorting[0]?.desc ? OrderEnum.ASC : OrderEnum.DESC,
      search,
      ...(status ? { status } : {})
    }),
    [pagination, sorting, search]
  )
}

export const useSourceFetch = (params: IGetSourceParams) => {
  const { data, isPending } = useQuery({
    queryKey: [SourceQueryKey.SOURCE, params],
    queryFn: () => getSources(params)
  })

  const hasNextPage = !!data?.meta.next

  return { data, isPending, hasNextPage }
}
