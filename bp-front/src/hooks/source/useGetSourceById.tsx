import { useQuery } from '@tanstack/react-query'

import { getSourceById } from '@/api/source/get-source-by-id'

interface MutationArgs {
  sourceId: string
}

export const SOURCE_QUERY_KEY = 'source'

export const useGetSourceById = ({ sourceId }: MutationArgs) => {
  const { data, isPending, isLoading, isFetched } = useQuery({
    queryKey: [SOURCE_QUERY_KEY, sourceId],
    queryFn: () => getSourceById({ sourceId }),
    enabled: !!sourceId
  })

  return { data, isPending, isLoading, isFetched }
}
