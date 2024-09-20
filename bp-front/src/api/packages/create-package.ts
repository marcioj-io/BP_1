import { api } from '@/lib/axios'
import { ICreatePackageBody } from '@/types/modules/packages'

export async function createPackage(body: ICreatePackageBody): Promise<string> {
  const { data } = await api.post<string>(`/packages`, body)
  return data
}
