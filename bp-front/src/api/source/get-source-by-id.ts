import { api } from '@/lib/axios'
import { ISource } from '@/types'

export async function getSourceById({ sourceId }: { sourceId: string }) {
  const data = await api.get<ISource>(`/sources/${sourceId}`)
  return data
}
