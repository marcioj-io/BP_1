import { useAtomValue } from 'jotai'

import { useGetCostCenterByClientId } from '@/hooks/cost-center/useGetCostCenterByClientId'
import { useGetAssignmentsByRoleId } from '@/hooks/tenant/useGetAssignmentsByRoleId'
import { useGetOneUser } from '@/hooks/users/useGetOneUser'
import { authAtom } from '@/store/user'

export const useUserData = (userId: string) => {
  const auth = useAtomValue(authAtom)

  const { data: user } = useGetOneUser(userId ?? '')
  const { data: assignments } = useGetAssignmentsByRoleId(
    user?.role?.id ?? auth?.user?.roleId ?? ''
  )
  const { data: costCenters } = useGetCostCenterByClientId(
    auth?.user?.clientId ?? ''
  )

  return { user, assignments, costCenters }
}
