import { MoveRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'

import { BaseCard } from './BaseCard'

const consultations = [
  {
    font: 'Lorem Ipsum Dolor Sit Amet Consectetur Elit',
    consult: '000'
  },
  {
    font: 'Lorem Ipsum Dolor Sit Amet Consectetur Elit',
    consult: '000'
  },
  {
    font: 'Lorem Ipsum Dolor Sit Amet Consectetur Elit',
    consult: '000'
  },
  {
    font: 'Lorem Ipsum Dolor Sit Amet Consectetur Elit',
    consult: '000'
  },
  {
    font: 'Lorem Ipsum Dolor Sit Amet Consectetur Elit',
    consult: '000'
  }
]

export const PendingConsultations = () => {
  return (
    <BaseCard title="Visão Geral de consultas pendentes">
      <div className="space-y-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fonte</TableHead>
              <TableHead className="w-[100px] text-center">Consulta</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {consultations.map((consultation, index) => (
              <TableRow
                key={Math.random()}
                className={index % 2 !== 0 ? 'bg-background-200' : ''}
              >
                <TableCell className="uppercase">{consultation.font}</TableCell>
                <TableCell className="text-center">
                  {consultation.consult}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Button className="flex gap-1.5">
          Ativar / desativar &apos;Fontes&apos; para essa sessão
          <MoveRight />
        </Button>
      </div>
    </BaseCard>
  )
}
