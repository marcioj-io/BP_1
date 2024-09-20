import '@tanstack/react-table'

import { ColumnDef } from '@tanstack/react-table'
import { format } from 'date-fns'

import { DataTableColumnHeader } from '@/components/ui/data-table'
import {
  ISystemLogs,
  SystemLogsTypeEnumLabel
} from '@/types/modules/system-logs'

export const columns: ColumnDef<ISystemLogs>[] = [
  {
    accessorKey: 'createdAt',
    id: 'createdAt',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DATA/HORA" />
    ),
    cell: ({ row }) =>
      format(new Date(row?.original?.createdAt), 'dd/MM/yyyy HH:mm')
  },
  {
    accessorKey: 'type',
    id: 'type',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ORIGEM" />
    ),
    cell: ({ row }) => SystemLogsTypeEnumLabel[row?.original?.type]
  },
  {
    accessorKey: 'userName',
    id: 'userName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="USUÁRIO" />
    )
  },
  {
    accessorKey: 'description',
    id: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="OCORRÊNCIA" />
    )
  }
]
