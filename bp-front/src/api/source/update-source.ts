import { api } from '@/lib/axios'
import { ISourceBody } from '@/types'

export async function updateSources(
  body: ISourceBody,
  sourceId: string
): Promise<string> {
  const { data } = await api.put<string>(`/sources/${sourceId}`, body)
  return data
}
