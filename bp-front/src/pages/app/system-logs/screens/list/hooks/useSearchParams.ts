import { useQuery } from '@tanstack/react-query'
import { PaginationState, SortingState } from '@tanstack/react-table'
import { useMemo } from 'react'

import {
  getSystemLogs,
  IGetSystemLogsParams
} from '@/api/system_logs/get-system-logs'
import { OrderEnum } from '@/types/paginatedParams'

export const SYSTEM_LOGS_KEY = 'system-logs'

interface IUseSystemLogsSearchParams {
  pagination: PaginationState
  sorting: SortingState
  search: string
  userName?: string
  startDate?: Date
  endDate?: Date
  type?: string
}

export const useSystemLogsSearchParams = (
  params: IUseSystemLogsSearchParams
) => {
  return useMemo(
    () => ({
      page: params.pagination.pageIndex + 1,
      perPage: params.pagination.pageSize,
      orderBy: params.sorting[0]?.id,
      order: params.sorting[0]?.desc ? OrderEnum.ASC : OrderEnum.DESC,
      ...params
    }),
    [params]
  )
}

export const useSystemLogsFetch = (params: IGetSystemLogsParams) => {
  const { data, isPending } = useQuery({
    queryKey: [SYSTEM_LOGS_KEY, params],
    queryFn: () => getSystemLogs(params)
  })

  const hasNextPage = !!data?.meta.next

  return { data, isPending, hasNextPage }
}
