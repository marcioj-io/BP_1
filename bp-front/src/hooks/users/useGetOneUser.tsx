import { useQuery } from '@tanstack/react-query'

import { getOneUser } from '@/api/users/get-one-user'

export const GET_ONE_USER_KEY = 'user'

export const useGetOneUser = (userId: string) => {
  return useQuery({
    queryKey: [GET_ONE_USER_KEY, userId],
    queryFn: () => getOneUser(userId),
    enabled: !!userId
  })
}
