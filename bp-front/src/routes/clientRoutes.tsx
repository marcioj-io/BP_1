import { Suspense } from 'react'
import { RouteObject } from 'react-router-dom'

import { ROUTES } from '@/constants'

export const clientRoutes: RouteObject[] = [
  {
    id: 'Início',
    path: ROUTES.DASHBOARD.HOME,
    lazy: async () => {
      const { ClientHome } = await import(
        '../pages/app/home/screens/clientHome'
      )
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <ClientHome />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Editar Perfil',
    path: ROUTES.CONFIG.HOME,
    lazy: async () => {
      const { Profile } = await import('../pages/app/config')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <Profile />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Usuários',
    path: ROUTES.USERS.LIST,
    lazy: async () => {
      const { UsersList } = await import('../pages/app/users')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <UsersList />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Criar Usuário',
    path: ROUTES.USERS.CREATE,
    lazy: async () => {
      const { CreateClientUser } = await import('../pages/app/users')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CreateClientUser />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Editar Usuário',
    path: ROUTES.USERS.EDIT_ROUTE,
    lazy: async () => {
      const { CreateClientUser } = await import('../pages/app/users')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CreateClientUser />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Centros de Custo',
    path: ROUTES.COST_CENTERS.LIST,
    lazy: async () => {
      const { CostCenterList } = await import('../pages/app/cost-centers')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CostCenterList />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Centros de Custo - Novo Cadastro',
    path: ROUTES.COST_CENTERS.CREATE,
    lazy: async () => {
      const { CreateCostCenter } = await import('../pages/app/cost-centers')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CreateCostCenter />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Centros de Custo - Editar',
    path: ROUTES.COST_CENTERS.EDIT_ROUTE,
    lazy: async () => {
      const { CreateCostCenter } = await import('../pages/app/cost-centers')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CreateCostCenter />
          </Suspense>
        )
      }
    }
  }
]
