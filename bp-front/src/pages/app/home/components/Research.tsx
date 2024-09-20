import { Search } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import { BaseCard } from './BaseCard'

export const Research = () => {
  return (
    <BaseCard title="Pesquisar">
      <div className="flex gap-2">
        <Input className="py-2.5" placeholder="Cliente" />
        <Input className="py-2.5" placeholder="Pessoa" />
        <Input
          className="py-2.5"
          placeholder="Pedido, pesquisa ou consulta..."
        />
        <Button className="flex gap-1.5" size="sm">
          <Search />
          Pesquisar
        </Button>
      </div>
    </BaseCard>
  )
}
