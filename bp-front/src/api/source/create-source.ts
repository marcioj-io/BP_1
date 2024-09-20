import { api } from '@/lib/axios'
import { ISourceBody } from '@/types'

export async function createSource(body: ISourceBody): Promise<string> {
  const { data } = await api.post<string>(`/sources`, body)
  return data
}
