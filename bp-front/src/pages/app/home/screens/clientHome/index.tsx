import { MoveRight, Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { InputWithIcon } from '@/components/ui/input-with-icon'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import { rowData } from '@/pages/app/users/screens/list/rowData'

import { BaseCard } from '../../components/BaseCard'

export const ClientHome = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">
          Bem-vindo(a) ao Sistema de Pesquisas AGINCO
        </h1>
        <Button className="flex gap-1.5" size="sm">
          <Search />
          Solicitar Pesquisas
        </Button>
      </div>

      <InputWithIcon
        placeholder="Pesquisar por CPF, CNPJ ou número do pedido (ID.)..."
        icon={Search}
        iconPosition="right"
        iconClassName="h-6 w-6"
      />

      <BaseCard title="Suas pesquisas recentes">
        <div className="space-y-4">
          <Table className="table-auto-layout border-collapse text-xs">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Pesquisa</TableHead>
                <TableHead>Data de envio</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Canal</TableHead>
                <TableHead>Obs</TableHead>
                <TableHead className="w-[1%] text-center">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rowData.map((data, index) => (
                <TableRow
                  key={Math.random()}
                  className={index % 2 === 0 ? 'bg-background-200' : ''}
                >
                  <TableCell className="underline">{data.id}</TableCell>
                  <TableCell>{data.pesquisa}</TableCell>
                  <TableCell>{data.dataEnvio}</TableCell>
                  <TableCell>{data.quantidade}</TableCell>
                  <TableCell>{data.canal}</TableCell>
                  <TableCell></TableCell>
                  <TableCell className="text-center">{data.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button className="flex gap-1.5">
            Ver todas as pesquisas
            <MoveRight />
          </Button>
        </div>
      </BaseCard>
    </div>
  )
}
