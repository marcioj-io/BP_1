import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
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

export const ApproveConsultations = () => {
  return (
    <BaseCard title="Aprovar consultas concluídas">
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
        <TableFooter>
          <TableRow>
            <TableCell className="text-right uppercase">Total</TableCell>
            <TableCell className="text-center">000</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </BaseCard>
  )
}
