import { useQuery } from '@tanstack/react-query'

import { getSources, IGetSourceParams } from '@/api/source/get-sources'

const SOURCE_KEY = 'source'

export const useGetSources = (params: IGetSourceParams) => {
  return useQuery({
    queryKey: [SOURCE_KEY, params],
    queryFn: () => getSources(params)
  })
}
