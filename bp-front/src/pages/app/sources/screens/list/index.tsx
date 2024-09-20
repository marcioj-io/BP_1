import { useQueryClient } from '@tanstack/react-query'
import { PaginationState, SortingState } from '@tanstack/react-table'
import { useDebounce } from '@uidotdev/usehooks'
import { useAtomValue } from 'jotai'
import { CirclePlus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getSources } from '@/api/source/get-sources'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { InputWithIcon } from '@/components/ui/input-with-icon'
import { ROUTES } from '@/constants'
import {
  SourceQueryKey,
  useSourceFetch,
  useSourceSearchParams
} from '@/hooks/source/useSearchParams'
import { authAtom } from '@/store/user'

import { columns } from './components/columns'

export const SourceList = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const auth = useAtomValue(authAtom)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')
  const clientId = auth?.user?.clientId ?? ''

  const debouncedSearch = useDebounce(search, 500)

  const fetchParams = useSourceSearchParams(
    pagination,
    sorting,
    debouncedSearch
  )
  const { data, isPending, hasNextPage } = useSourceFetch({
    ...fetchParams,
    clientId
  })

  useEffect(() => {
    if (hasNextPage) {
      const nextPage = pagination.pageIndex + 1
      queryClient.prefetchQuery({
        queryKey: [SourceQueryKey.SOURCE, { ...fetchParams, page: nextPage }],
        queryFn: () => getSources({ ...fetchParams, page: nextPage, clientId })
      })
    }
  }, [fetchParams, hasNextPage, pagination.pageIndex, queryClient, clientId])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearch])

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between text-xl font-semibold">
          <h1>Fontes de Pesquisa</h1>
          <Button
            className="gap-1.5"
            onClick={() => navigate(ROUTES.SOURCES.CREATE)}
          >
            Cadastrar nova <CirclePlus />
          </Button>
        </div>
        <div className="flex gap-4">
          <InputWithIcon
            className="py-3"
            placeholder="Pesquisar por nome ou descrição..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />
        </div>

        <DataTable
          columns={columns}
          data={data?.data ?? []}
          pagination={pagination}
          setPagination={setPagination}
          rowCount={data?.meta.total ?? 0}
          sorting={sorting}
          setSorting={setSorting}
          isPending={isPending}
          meta={data?.meta}
        />
      </div>
    </>
  )
}
