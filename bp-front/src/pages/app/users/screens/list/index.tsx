import { useQueryClient } from '@tanstack/react-query'
import { PaginationState, SortingState } from '@tanstack/react-table'
import { useDebounce } from '@uidotdev/usehooks'
import { CirclePlus, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { getUsers } from '@/api/users/get-users'
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
import { USERS_QUERY_KEY } from '@/hooks/users/useGetUsers'
import { UserStatusEnum } from '@/types'

import { columns } from './components/columns'
import { useUserFetch, useUserSearchParams } from './hooks/useSearchParams'

export const UsersList = () => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  })
  const [sorting, setSorting] = useState<SortingState>([])
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')

  const debouncedSearch = useDebounce(search, 500)

  const fetchParams = useUserSearchParams(
    pagination,
    sorting,
    debouncedSearch,
    status
  )
  const { data, isPending, hasNextPage } = useUserFetch(fetchParams)

  useEffect(() => {
    if (hasNextPage) {
      const nextPage = pagination.pageIndex + 1
      queryClient.prefetchQuery({
        queryKey: [USERS_QUERY_KEY, { ...fetchParams, page: nextPage }],
        queryFn: () => getUsers({ ...fetchParams, page: nextPage })
      })
    }
  }, [fetchParams, hasNextPage, pagination.pageIndex, queryClient])

  return (
    <div className="space-y-6">
      <div className="flex justify-between text-xl font-semibold">
        <h1>Usuários</h1>
        <Button
          className="gap-1.5"
          onClick={() => navigate(ROUTES.USERS.CREATE)}
        >
          Cadastrar novo <CirclePlus />
        </Button>
      </div>
      <div className="flex gap-4">
        <InputWithIcon
          className="py-2"
          placeholder="Pesquisar por nome do usuário..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
        />
        <Select
          onValueChange={(value) => setStatus(value === 'NONE' ? '' : value)}
          defaultValue={status}
        >
          <SelectTrigger className="w-32 py-3">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="NONE">Status</SelectItem>
            <SelectItem value={UserStatusEnum.ACTIVE}>Ativo</SelectItem>
            <SelectItem value={UserStatusEnum.INACTIVE}>Inativo</SelectItem>
            <SelectItem value={UserStatusEnum.PENDING}>Pendente</SelectItem>
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
  )
}
