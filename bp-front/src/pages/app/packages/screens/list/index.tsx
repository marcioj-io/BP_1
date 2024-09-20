import { useQueryClient } from '@tanstack/react-query'
import { PaginationState, SortingState } from '@tanstack/react-table'
import { useDebounce } from '@uidotdev/usehooks'
import { CirclePlus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getPackages } from '@/api/packages/get-packages'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { InputWithIcon } from '@/components/ui/input-with-icon'
import { ROUTES } from '@/constants'
import { PACKAGES_QUERY_KEY } from '@/hooks/package/useGetPackages'

import { columns } from './components/columns'
import { usePackagesFetch, usePackagesParams } from './hooks/useSearchParams'

export const PackagesList = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')

  const debouncedSearch = useDebounce(search, 500)

  const fetchParams = usePackagesParams(pagination, sorting, debouncedSearch)

  const { data, isPending, hasNextPage } = usePackagesFetch(fetchParams)

  useEffect(() => {
    if (hasNextPage) {
      const nextPage = pagination.pageIndex + 1
      queryClient.prefetchQuery({
        queryKey: [PACKAGES_QUERY_KEY, { ...fetchParams, page: nextPage }],
        queryFn: () => getPackages({ ...fetchParams, page: nextPage })
      })
    }
  }, [fetchParams, hasNextPage, pagination.pageIndex, queryClient])

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-xl font-semibold">
        <h1>Pacotes</h1>
        <Button
          className="gap-1.5"
          onClick={() => navigate(ROUTES.PACKAGES.CREATE)}
        >
          Cadastrar novo <CirclePlus />
        </Button>
      </div>
      <div className="flex">
        <InputWithIcon
          className="py-2"
          placeholder="Pesquisar por nome do pacote..."
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
  )
}
