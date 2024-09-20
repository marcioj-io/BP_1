import { api } from '@/lib/axios'
import { IPackages } from '@/types/modules/packages'

export interface IDeletePackageParams {
  id: string
  version: number
}

export async function deletePackage({ id, version }: IDeletePackageParams) {
  const { data } = await api.delete<IPackages>(`/packages/${id}`, {
    params: {
      version
    }
  })
  return data
}
