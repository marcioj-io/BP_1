import { api } from '@/lib/axios'

export async function deleteSourceById({
  sourceId,
  version
}: {
  sourceId: string
  version: number
}) {
  const { data } = await api.delete<void>(
    `/sources/${sourceId}/?version=${version}`
  )
  return data
}
