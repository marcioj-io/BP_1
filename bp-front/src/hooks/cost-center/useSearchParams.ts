import { useQuery } from '@tanstack/react-query'
import { PaginationState, SortingState } from '@tanstack/react-table'
import { useMemo } from 'react'

import {
  getCostCenters,
  IGetCostCenterParams
} from '@/api/cost-center/get-cost-centers'
import { OrderEnum } from '@/types/paginatedParams'

export enum CostCentersQueryKey {
  COST_CENTERS = 'cost-centers'
}

export const useCostCenterSearchParams = (
  pagination: PaginationState,
  sorting: SortingState,
  search: string,
  status: string
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
    [pagination, sorting, search, status]
  )
}

export const useCostCentersFetch = (params: IGetCostCenterParams) => {
  const { data, isPending } = useQuery({
    queryKey: [CostCentersQueryKey.COST_CENTERS, params],
    queryFn: () => getCostCenters(params)
  })

  const hasNextPage = !!data?.meta.next

  return { data, isPending, hasNextPage }
}
