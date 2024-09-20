import { api } from '@/lib/axios'
import { IAssignment } from '@/types/modules/tenant/assignments'

export async function getAssignmentsByRoleId(params: { role: string }) {
  const { data } = await api.get<IAssignment[]>('/tenant/assignments', {
    params: {
      ...params,
      module: 'ADMIN'
    }
  })
  return data
}
