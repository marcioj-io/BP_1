import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  SortingState,
  useReactTable,
  VisibilityState
} from '@tanstack/react-table'
import { useState } from 'react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { Skeleton } from '../skeleton'
import { DataTablePagination } from './data-table-pagination'

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  pagination: PaginationState
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>
  rowCount: number
  sorting: SortingState
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>
  isPending: boolean
  meta?: { [key: string]: number }
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pagination,
  setPagination,
  rowCount,
  sorting,
  setSorting,
  isPending,
  ...props
}: DataTableProps<TData, TValue>) {
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const table = useReactTable({
    data,
    columns,

    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    state: {
      pagination,
      sorting,
      columnVisibility
    },
    rowCount,
    manualPagination: true,
    manualSorting: true
  })

  return (
    <div>
      {/* <div className="flex items-center py-4">
        <DataTableViewOptions table={table} />
      </div> */}
      <div className="mt-6 rounded-md bg-white p-4">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'px-3 py-4 text-xs font-medium',
                        header.column.columnDef.meta?.classNameHeader
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isPending ? (
              Array.from({
                length: table.getState().pagination.pageSize
              }).map((_, rowIndex) => (
                <TableRow key={rowIndex}>
                  {columns.map((cell, colIndex) => (
                    <TableCell
                      key={colIndex}
                      className={cn('px-2 py-3 text-sm', cell.meta?.className)}
                    >
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row, index) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                  className={index % 2 !== 0 ? 'bg-background-200' : ''}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        'px-2 py-3 text-sm',
                        cell.column.columnDef.meta?.className
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="py-4">
        <DataTablePagination table={table} meta={props.meta} />
      </div>
    </div>
  )
}
