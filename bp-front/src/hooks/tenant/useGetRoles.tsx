import { useQuery } from '@tanstack/react-query'

import { getRoles } from '@/api/tenant/get-roles'

export const ROLES = 'roles'

export const useGetRoles = () => {
  return useQuery({
    queryKey: [ROLES],
    queryFn: () => getRoles()
  })
}
