import '@tanstack/react-table'

import { useQueryClient } from '@tanstack/react-query'
import { ColumnDef, Row } from '@tanstack/react-table'
import { useSetAtom } from 'jotai'
import { useNavigate } from 'react-router-dom'

import { getOnePackage } from '@/api/packages/get-one-package'
import { EditIcon } from '@/assets/icons/Edit'
import { TrashIcon } from '@/assets/icons/Trash'
import { DataTableColumnHeader } from '@/components/ui/data-table'
import { ROUTES } from '@/constants'
import { useDeletePackage } from '@/hooks/package/useDeletePackage'
import { GET_ONE_PACKAGE_KEY } from '@/hooks/package/useGetOnePackage'
import { PACKAGES_QUERY_KEY } from '@/hooks/package/useGetPackages'
import { modalAtom } from '@/store/modal'
import { IPackages } from '@/types/modules/packages'
import { TCustomError } from '@/types/responseError'

const ActionCell = ({ row }: { row: Row<IPackages> }) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const setModal = useSetAtom(modalAtom)
  const { mutateAsync: deletePackage } = useDeletePackage()

  const edit = (id: string) => {
    navigate(`${ROUTES.PACKAGES.EDIT}/${id}`)
  }

  const prefetchPackageData = (id: string) => {
    queryClient.prefetchQuery({
      queryKey: [GET_ONE_PACKAGE_KEY, id],
      queryFn: () => getOnePackage(id)
    })
  }

  const handleDeletePackage = async () => {
    try {
      await deletePackage({
        id: row.original.id,
        version: row.original.version
      })
      setModal({
        open: true,
        type: 'success',
        onClose: () => console.log('modal closed'),
        onConfirm: async () => console.log('confirm'),
        content: {
          title: 'Exclusão realizada com sucesso!',
          message: 'O pacote selecionado foi excluído permanentemente.'
        }
      })
      queryClient.invalidateQueries({ queryKey: [PACKAGES_QUERY_KEY] })
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
      onConfirm: handleDeletePackage,
      content: {
        title: `Tem certeza que deseja excluir?`,
        message:
          'Se você continuar com esta ação, o pacote será excluído e não poderá ser recuperado.'
      }
    })
  }

  return (
    <div className="flex gap-3 text-text">
      <div
        className="cursor-pointer hover:text-brand-highlight"
        onClick={() => edit(row.original.id)}
        onMouseEnter={() => prefetchPackageData(row.original.id)}
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

export const columns: ColumnDef<IPackages>[] = [
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
    id: 'actions',
    header: 'Ações',
    cell: ({ row }) => {
      return <ActionCell row={row} />
    }
  }
]
