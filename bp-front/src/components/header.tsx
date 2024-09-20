import { useAtom } from 'jotai'
import { LogOutIcon, UserIcon } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { ROUTES } from '@/constants'
import { useGetCostCenters } from '@/hooks/cost-center/useGetCostCenters'
import { cn } from '@/lib/utils'
import { RoleEnum } from '@/routes/rules'
import { costCenterAtom } from '@/store/cost-center'
import { authAtom } from '@/store/user'
import { StatusEnum } from '@/types/modules/packages'

import { CostCenterModal } from './CostCenterModal'
import { ModeToggle } from './mode-toggle'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from './ui/select'

export function Header({ className }: { className?: string }) {
  const navigate = useNavigate()

  const [costCenter, setCostCenter] = useAtom(costCenterAtom)
  const [auth, setAuth] = useAtom(authAtom)

  const isUser = auth?.user?.role === RoleEnum.USER

  const logout = () => {
    setAuth(null)
    navigate(ROUTES.AUTH.LOGIN)
  }

  const { data: costCenters } = useGetCostCenters({
    clientId: auth?.user?.clientId ?? '',
    status: StatusEnum.ACTIVE
  })

  return (
    <header
      className={cn(
        className,
        'flex items-center border-b-[0.2px] border-b-text px-6'
      )}
    >
      <div className="flex w-full items-center justify-between gap-6">
        <div>
          {isUser && (
            <Select onValueChange={setCostCenter} value={costCenter}>
              <SelectTrigger
                className="gap-2 border-0 font-semibold text-brand-secondary"
                chevronClassName="opacity-100"
              >
                <SelectValue placeholder="Selecione o Centro de Custo..." />
              </SelectTrigger>
              <SelectContent>
                {costCenters?.data?.map((costCenter) => (
                  <SelectItem key={costCenter.id} value={costCenter.id}>
                    {costCenter.name}
                  </SelectItem>
                )) || []}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-6">
          <ModeToggle />

          <div className="text-right">
            <p className="text-sm font-bold text-brand-secondary">
              {auth?.user?.name}
            </p>
            <p className="text-xs text-neutral-400">
              (Se você não é esse usuário, clique aqui.)
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="m-0 flex items-center rounded-full bg-brand-secondary p-0 text-neutral-0"
                size="icon"
                variant="ghost"
              >
                {!auth?.user?.avatar ? (
                  (
                    (auth?.user?.name.split(' ')[0][0] ?? '') +
                    (auth?.user?.name.split(' ')[1]?.[0] ?? '')
                  ).toUpperCase()
                ) : (
                  <img
                    alt="Avatar"
                    className="rounded-full"
                    src={auth?.user?.avatar}
                    style={{
                      aspectRatio: '32/32',
                      objectFit: 'cover'
                    }}
                  />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => navigate(ROUTES.CONFIG.HOME)}>
                <UserIcon className="mr-2 h-4 w-4" />
                Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOutIcon className="mr-2 h-4 w-4" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isUser && !costCenter && <CostCenterModal />}
    </header>
  )
}
