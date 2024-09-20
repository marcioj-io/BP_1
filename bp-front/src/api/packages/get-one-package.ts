import { api } from '@/lib/axios'
import { IPackage } from '@/types/modules/packages'

export async function getOnePackage(id: string) {
  const { data } = await api.get<IPackage>(`/packages/${id}`)

  return data
}
