import { Button } from '@/components/ui/button'

import { ApproveConsultations } from '../../components/ApproveConsultations'
import { AssignConsultations } from '../../components/AssignConsultations'
import { PendingConsultations } from '../../components/PendingConsultations'
import { Research } from '../../components/Research'

export const AdminHome = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between">
        <h1 className="text-xl font-semibold">Bem-vindo(a), Lorem Ipsum</h1>
        <Button variant="action" size="sm">
          Pegar próxima consulta
        </Button>
      </div>

      <Research />

      <PendingConsultations />

      <div className="flex gap-6">
        <ApproveConsultations />
        <AssignConsultations />
      </div>
    </div>
  )
}
