import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'

import { BaseCard } from './BaseCard'

export const AssignConsultations = () => {
  return (
    <BaseCard title="Atribuir consultas a usuário">
      <div className="space-y-4 text-sm">
        <div className="space-y-2">
          <Label htmlFor="source">
            Fonte <span className="text-action">*</span>
          </Label>
          <Select>
            <SelectTrigger id="source">
              <SelectValue placeholder="Selecione a Fonte..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Fonte 1</SelectItem>
              <SelectItem value="dark">Fonte 2</SelectItem>
              <SelectItem value="system">Fonte 3</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-4">
          <div className="space-y-2">
            <Label htmlFor="consults">
              Consultas <span className="text-action">*</span>
            </Label>
            <Input
              id="consults"
              className="h-[50px] py-4"
              placeholder="Digite..."
            />
          </div>
          <div className="w-full space-y-2">
            <Label htmlFor="user">
              Usuário <span className="text-action">*</span>
            </Label>
            <Select>
              <SelectTrigger id="user" className="w-full">
                <SelectValue placeholder="Selecione o Status..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Status 1</SelectItem>
                <SelectItem value="dark">Status 2</SelectItem>
                <SelectItem value="system">Status 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button className="flex gap-1.5">Atribuir consultas</Button>
      </div>
    </BaseCard>
  )
}
