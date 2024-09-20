import { PaginationState, SortingState } from '@tanstack/react-table'
import { useMemo } from 'react'

import { IGetUsersParams } from '@/api/users/get-users'
import { useGetUsers } from '@/hooks/users/useGetUsers'
import { OrderEnum } from '@/types/paginatedParams'

export const useUserSearchParams = (
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
      order: sorting[0]?.desc ? OrderEnum.DESC : OrderEnum.ASC,
      search,
      ...(status && { status })
    }),
    [pagination, sorting, search, status]
  )
}

export enum UserQueryKey {
  USERS = 'users'
}

export const useUserFetch = (params: IGetUsersParams) => {
  const { data, isPending } = useGetUsers(params)

  const hasNextPage = !!data?.meta.next

  return { data, isPending, hasNextPage }
}
