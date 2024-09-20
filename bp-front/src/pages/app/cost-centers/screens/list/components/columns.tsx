import '@tanstack/react-table'

import { ColumnDef, Row } from '@tanstack/react-table'
import { useAtomValue, useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'

import { getCostCenterById } from '@/api/cost-center/get-cost-center-by-id'
import { EditIcon } from '@/assets/icons/Edit'
import { TrashIcon } from '@/assets/icons/Trash'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { ROUTES } from '@/constants'
import { useDeleteCostCenter } from '@/hooks/cost-center/useDeleteCostCenter'
import { COST_CENTER_BY_ID_QUERY_KEY } from '@/hooks/cost-center/useGetCostCenterById'
import { queryClient } from '@/lib/query-client'
import { modalAtom } from '@/store/modal'
import { authAtom } from '@/store/user'
import { CostCenterStatusEnum, ICostCenter } from '@/types'
import { TCustomError } from '@/types/responseError'

import { StatusIndicator } from './StatusIndicator'

const ActionCell = ({ row }: { row: Row<ICostCenter> }) => {
  const { mutateAsync: deleteCostCenter } = useDeleteCostCenter()
  const auth = useAtomValue(authAtom)
  const setModal = useSetAtom(modalAtom)
  const navigate = useNavigate()

  const clientId = auth?.user?.clientId ?? ''
  const costCenterId = row.original.id ?? ''
  const version = row.original.version ?? ''

  const edit = () => {
    navigate(`${ROUTES.COST_CENTERS.EDIT}/${costCenterId}`)
  }

  const prefetchUserData = () => {
    queryClient.prefetchQuery({
      queryKey: [COST_CENTER_BY_ID_QUERY_KEY, { costCenterId, clientId }],
      queryFn: () => getCostCenterById({ costCenterId, clientId })
    })
  }

  const handleDelete = async () => {
    try {
      await deleteCostCenter({ costCenterId, clientId, version })
      setModal({
        open: true,
        type: 'success',
        onClose: () => console.log('modal closed'),
        onConfirm: async () => console.log('confirm'),
        content: {
          title: 'Exclusão realizada com sucesso!',
          message: 'O Centro de custo selecionado foi excluído permanentemente.'
        }
      })
    } catch (error) {
      const customError = error as TCustomError
      const message = customError.response.data.messages.join(',')
      setModal({
        open: true,
        type: 'error',
        onClose: () => console.log('modal closed'),
        onConfirm: async () => console.log('confirm'),
        content: {
          title: 'Sua solicitação não pode ser concluída.',
          message
        }
      })
    }
  }

  const handleConfirmDelete = async () => {
    setModal({
      open: true,
      type: 'error',
      onClose: () => console.log('modal closed'),
      onConfirm: handleDelete,
      content: {
        title: `Tem certeza que deseja excluir o centro de custo ${row.original.name}?`,
        message:
          'Se você continuar com esta ação, o centro de custo será excluído e não poderá ser recuperado.'
      }
    })
  }

  return (
    <div className="flex gap-3 text-text">
      <div
        className="cursor-pointer hover:text-brand-highlight"
        onClick={edit}
        onMouseEnter={prefetchUserData}
      >
        <EditIcon />
      </div>
      <div
        className="cursor-pointer hover:text-brand-highlight"
        onClick={handleConfirmDelete}
        onMouseEnter={prefetchUserData}
      >
        <TrashIcon />
      </div>
    </div>
  )
}

export const columns: ColumnDef<ICostCenter>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Código" />
    )
  },
  {
    accessorKey: 'description',
    id: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Descrição" />
    )
  },
  {
    accessorKey: 'status',
    id: 'status',
    meta: {
      classNameHeader: 'flex justify-center'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <StatusIndicator
          status={
            CostCenterStatusEnum[
              row.original.status as keyof typeof CostCenterStatusEnum
            ]
          }
        />
      )
    }
  },
  {
    id: 'actions',
    header: 'Ações',
    meta: {
      className: 'w-[1%]'
    },
    cell: ({ row }) => {
      return <ActionCell row={row} />
    }
  }
]
