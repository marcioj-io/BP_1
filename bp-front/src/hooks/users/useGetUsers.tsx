import { useQuery } from '@tanstack/react-query'

import { getUsers, IGetUsersParams } from '@/api/users/get-users'

export const USERS_QUERY_KEY = 'users'

export const useGetUsers = (params?: IGetUsersParams) => {
  const { data, isPending } = useQuery({
    queryKey: [USERS_QUERY_KEY, params],
    queryFn: () => getUsers(params)
  })

  const hasNextPage = !!data?.meta.next

  return { data, isPending, hasNextPage }
}
