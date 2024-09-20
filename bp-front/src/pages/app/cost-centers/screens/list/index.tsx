import { useQueryClient } from '@tanstack/react-query'
import { PaginationState, SortingState } from '@tanstack/react-table'
import { useDebounce } from '@uidotdev/usehooks'
import { useAtomValue } from 'jotai'
import { CirclePlus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getCostCenters } from '@/api/cost-center/get-cost-centers'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { InputWithIcon } from '@/components/ui/input-with-icon'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { ROUTES } from '@/constants'
import { authAtom } from '@/store/user'

import {
  CostCentersQueryKey,
  useCostCenterSearchParams,
  useCostCentersFetch
} from '../../../../../hooks/cost-center/useSearchParams'
import { columns } from './components/columns'

export const CostCenterList = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const auth = useAtomValue(authAtom)

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })

  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const clientId = auth?.user?.clientId ?? ''

  const debouncedSearch = useDebounce(search, 500)

  const fetchParams = useCostCenterSearchParams(
    pagination,
    sorting,
    debouncedSearch,
    status
  )
  const { data, isPending, hasNextPage } = useCostCentersFetch({
    ...fetchParams,
    clientId
  })

  useEffect(() => {
    if (hasNextPage) {
      const nextPage = pagination.pageIndex + 1
      queryClient.prefetchQuery({
        queryKey: [
          CostCentersQueryKey.COST_CENTERS,
          { ...fetchParams, page: nextPage }
        ],
        queryFn: () =>
          getCostCenters({ ...fetchParams, page: nextPage, clientId })
      })
    }
  }, [fetchParams, hasNextPage, pagination.pageIndex, queryClient, clientId])

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }))
  }, [debouncedSearch, status])

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between text-xl font-semibold">
          <h1>Centros de Custo</h1>
          <Button
            className="gap-1.5"
            onClick={() => navigate(ROUTES.COST_CENTERS.CREATE)}
          >
            Cadastrar novo <CirclePlus />
          </Button>
        </div>
        <div className="flex gap-4">
          <InputWithIcon
            name="search"
            className="py-2"
            placeholder="Pesquisar por código ou descrição do centro de custo..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            icon={Search}
          />
          <Select
            name="status"
            onValueChange={(value) => setStatus(value === 'NONE' ? '' : value)}
            defaultValue={status}
          >
            <SelectTrigger className="w-32 py-3">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="NONE">Status</SelectItem>
              <SelectItem value="ACTIVE">Ativo</SelectItem>
              <SelectItem value="INACTIVE">Inativo</SelectItem>
            </SelectContent>
          </Select>
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
