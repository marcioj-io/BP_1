import { useQueryClient } from '@tanstack/react-query'
import { PaginationState, SortingState } from '@tanstack/react-table'
import { useDebounce } from '@uidotdev/usehooks'
import { useAtomValue } from 'jotai'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { DateParam, StringParam, useQueryParams } from 'use-query-params'

import { getSystemLogs } from '@/api/system_logs/get-system-logs'
import { DataTable } from '@/components/ui/data-table'
import { InputWithIcon } from '@/components/ui/input-with-icon'
import { authAtom } from '@/store/user'

import { columns } from './components/columns'
import { Filters } from './components/filters'
import {
  SYSTEM_LOGS_KEY,
  useSystemLogsFetch,
  useSystemLogsSearchParams
} from './hooks/useSearchParams'

export const SystemLogsList = () => {
  const queryClient = useQueryClient()
  const auth = useAtomValue(authAtom)

  const [query] = useQueryParams({
    startDate: DateParam,
    endDate: DateParam,
    user: StringParam,
    type: StringParam
  })

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')

  const clientId = auth?.user?.clientId ?? ''

  const debouncedSearch = useDebounce(search, 500)

  const fetchParams = useSystemLogsSearchParams({
    pagination,
    sorting,
    search: debouncedSearch,
    startDate: query.startDate ?? undefined,
    endDate: query.endDate ?? undefined,
    userName: query.user ?? undefined,
    type: query.type ?? undefined
  })

  const { data, isPending, hasNextPage } = useSystemLogsFetch({
    ...fetchParams,
    clientId
  })

  useEffect(() => {
    if (hasNextPage) {
      const nextPage = pagination.pageIndex + 1
      queryClient.prefetchQuery({
        queryKey: [SYSTEM_LOGS_KEY, { ...fetchParams, page: nextPage }],
        queryFn: () =>
          getSystemLogs({ ...fetchParams, page: nextPage, clientId })
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
          <h1>Log do Sistema</h1>
        </div>
        <div className="flex items-center justify-center gap-4">
          <InputWithIcon
            className="py-2"
            placeholder="Pesquisar por ocorrência..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
          />

          <Filters />
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
