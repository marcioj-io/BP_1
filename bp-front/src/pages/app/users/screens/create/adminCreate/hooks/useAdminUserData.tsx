import { useAtomValue } from 'jotai'

import { IGetSourceParams } from '@/api/source/get-sources'
import { useGetSources } from '@/hooks/source/useGetSources'
import { useGetAssignmentsByRoleId } from '@/hooks/tenant/useGetAssignmentsByRoleId'
import { useGetOneUser } from '@/hooks/users/useGetOneUser'
import { authAtom } from '@/store/user'

export const useAdminUserData = (userId: string) => {
  const auth = useAtomValue(authAtom)

  const { data: user } = useGetOneUser(userId ?? '')
  const { data: assignments } = useGetAssignmentsByRoleId(
    user?.role?.id ?? auth?.user?.roleId ?? ''
  )
  const { data: sources } = useGetSources({} as IGetSourceParams)

  return { user, assignments, sources }
}
