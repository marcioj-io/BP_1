import { useAtomValue } from 'jotai'
import {
  BriefcaseBusiness,
  FileText,
  FolderIcon,
  HomeIcon,
  Package,
  UsersIcon
} from 'lucide-react'

import { RoleEnum } from '@/routes/rules'
import { authAtom } from '@/store/user'

import { ROUTES } from '.'

const adminRoutes = [
  {
    title: 'Início',
    route: ROUTES.DASHBOARD.HOME,
    icon: <HomeIcon />
  },
  {
    title: 'Usuários',
    route: ROUTES.USERS.LIST,
    icon: <UsersIcon />
  },
  {
    title: 'Pacotes',
    route: ROUTES.PACKAGES.LIST,
    icon: <Package />
  },
  {
    title: 'Log do Sistema',
    route: ROUTES.SYSTEM_LOGS.LIST,
    icon: <FileText />
  },
  {
    title: 'Fontes de Pesquisa',
    route: ROUTES.SOURCES.LIST,
    icon: <FolderIcon />
  }
]

const clientRoutes = [
  {
    title: 'Início',
    route: ROUTES.DASHBOARD.HOME,
    icon: <HomeIcon />
  },
  {
    title: 'Usuários',
    route: ROUTES.USERS.LIST,
    icon: <UsersIcon />
  },
  {
    title: 'Centros de Custo',
    route: ROUTES.COST_CENTERS.LIST,
    icon: <BriefcaseBusiness />
  }
]

export const useMenuItems = () => {
  const auth = useAtomValue(authAtom)

  const routes =
    auth?.user?.role === RoleEnum.ADMIN ? adminRoutes : clientRoutes

  // const hasPermission = (module: Modules) => {
  //   if (!auth?.user) return false
  //   const userAssignments: TAssignmentForValidate[] =
  //     auth.user.assignments || []

  //   return userAssignments.some(
  //     (assignment) => assignment.assignment === rules[module]
  //   )
  // }

  return { menuItems: routes }
}
