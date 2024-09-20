import { useQuery } from '@tanstack/react-query'

import { getAssignmentsByRoleId } from '@/api/tenant/get-assignments-by-role-id'

export const ASSIGNMENTS = 'assignments'

export const useGetAssignmentsByRoleId = (roleId: string) => {
  return useQuery({
    queryKey: [ASSIGNMENTS, roleId],
    queryFn: () => getAssignmentsByRoleId({ role: roleId }),
    enabled: !!roleId
  })
}
