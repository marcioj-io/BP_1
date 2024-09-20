import '@tanstack/react-table' //or vue, svelte, solid, qwik, etc.

import { ColumnDef, Row } from '@tanstack/react-table'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'

import { getSourceById } from '@/api/source/get-source-by-id'
import { EditIcon } from '@/assets/icons/Edit'
import { TrashIcon } from '@/assets/icons/Trash'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { ROUTES } from '@/constants'
import { useDeleteSource } from '@/hooks/source/useDeleteSource'
import { SOURCE_QUERY_KEY } from '@/hooks/source/useGetSourceById'
import { queryClient } from '@/lib/query-client'
import { modalAtom } from '@/store/modal'
import { ISource } from '@/types'
import { TCustomError } from '@/types/responseError'

const ActionCell = ({ row }: { row: Row<ISource> }) => {
  const { mutateAsync: deleteSource } = useDeleteSource()
  const setModal = useSetAtom(modalAtom)
  const navigate = useNavigate()

  const sourceId = row.original.id ?? ''
  const version = row.original.version ?? ''

  const edit = () => {
    navigate(`${ROUTES.SOURCES.EDIT}/${sourceId}`)
  }

  const prefetchUserData = () => {
    queryClient.prefetchQuery({
      queryKey: [SOURCE_QUERY_KEY, sourceId],
      queryFn: () => getSourceById({ sourceId })
    })
  }

  const handleDelete = async () => {
    try {
      await deleteSource({ sourceId, version })
      setModal({
        open: true,
        type: 'success',
        onClose: () => console.log('modal closed'),
        onConfirm: async () => console.log('confirm'),
        content: {
          title: 'Exclusão realizada com sucesso!',
          message:
            'A fonte de pesquisa selecionada foi excluída permanentemente.'
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
        title: `Tem certeza que deseja excluir?`,
        message:
          'Se você continuar com esta ação, a fonte de pesquisa será excluída e não poderá ser recuperada.'
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

export const columns: ColumnDef<ISource>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="NOME" />
    )
  },
  {
    accessorKey: 'description',
    id: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DESCRIÇÃO" />
    )
  },
  {
    accessorKey: 'unitCost',
    id: 'unitCost',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="CUSTO UNITÁRIO" />
    ),
    cell: ({ row }) =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(Number(row?.original?.unitCost))
  },
  {
    accessorKey: 'validityInDays',
    id: 'validityInDays',
    meta: {
      className: 'text-center',
      classNameHeader: 'w-[1%] mx-auto'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="VALIDADE (DIAS)" />
    )
  },

  {
    id: 'actions',
    header: 'Ações',
    meta: {
      classNameHeader: 'w-[1%] mx-auto',
      className: 'text-center'
    },
    cell: ({ row }) => {
      return <ActionCell row={row} />
    }
  }
]
