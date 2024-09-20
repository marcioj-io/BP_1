import '@tanstack/react-table'

import { useQueryClient } from '@tanstack/react-query'
import { ColumnDef, Row } from '@tanstack/react-table'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'

import { getOneUser } from '@/api/users/get-one-user'
import { EditIcon } from '@/assets/icons/Edit'
import { TrashIcon } from '@/assets/icons/Trash'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { ROUTES } from '@/constants'
import { useDeleteUser } from '@/hooks/users/useDeleteUser'
import { GET_ONE_USER_KEY } from '@/hooks/users/useGetOneUser'
import { USERS_QUERY_KEY } from '@/hooks/users/useGetUsers'
import { modalAtom } from '@/store/modal'
import { IUser, UserStatusEnum } from '@/types'
import { TCustomError } from '@/types/responseError'

import { StatusIndicator } from './StatusIndicator'

const ActionCell = ({ row }: { row: Row<IUser> }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setModal = useSetAtom(modalAtom)
  const { mutateAsync: deleteUser } = useDeleteUser()

  const edit = (id: string) => {
    navigate(`${ROUTES.USERS.EDIT}/${id}`)
  }

  const prefetchUserData = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: [GET_ONE_USER_KEY, id],
      queryFn: () => getOneUser(id)
    })
  }

  const handleDeleteUser = async () => {
    try {
      await deleteUser({ id: row.original.id, version: row.original.version })
      setModal({
        open: true,
        type: 'success',
        onClose: () => console.log('modal closed'),
        onConfirm: async () => console.log('confirm'),
        content: {
          title: 'Exclusão realizada com sucesso!',
          message: 'O usuário selecionado foi excluído permanentemente.'
        }
      })
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] })
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
      onConfirm: handleDeleteUser,
      content: {
        title: `Tem certeza que deseja excluir?`,
        message:
          'Se você continuar com esta ação, o usuário será excluído e não poderá ser recuperado.'
      }
    })
  }

  return (
    <div className="flex gap-3 text-text">
      <div
        className="cursor-pointer hover:text-brand-highlight"
        onClick={() => edit(row.original.id)}
        onMouseEnter={() => prefetchUserData(row.original.id)}
      >
        <EditIcon />
      </div>
      <div
        className="cursor-pointer hover:text-brand-highlight"
        onClick={handleConfirmDelete}
      >
        <TrashIcon />
      </div>
    </div>
  )
}

export const columns: ColumnDef<IUser>[] = [
  {
    accessorKey: 'name',
    id: 'name',
    meta: {
      className: 'w-full'
    },
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nome" />
    )
  },
  {
    accessorKey: 'status',
    id: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      return (
        <div className="text-center">
          <StatusIndicator status={UserStatusEnum[row.original.status]} />
        </div>
      )
    }
  },
  {
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      return <ActionCell row={row} />
    }
  }
]
