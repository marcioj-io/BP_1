import { api } from '@/lib/axios'
import { IUpdatePackageBody } from '@/types/modules/packages'

export async function updatePackage(
  packageId: string,
  body: IUpdatePackageBody
): Promise<string> {
  const { data } = await api.put<string>(`/packages/${packageId}`, body)
  return data
}
