import { Suspense } from 'react'
import { RouteObject } from 'react-router-dom'

import { ROUTES } from '@/constants'

export const adminRoutes: RouteObject[] = [
  {
    id: 'Início',
    path: ROUTES.DASHBOARD.HOME,
    lazy: async () => {
      const { AdminHome } = await import('../pages/app/home/')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <AdminHome />
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
      const { AdminCreateUser } = await import('../pages/app/users')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <AdminCreateUser />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Editar Usuário',
    path: ROUTES.USERS.EDIT_ROUTE,
    lazy: async () => {
      const { AdminCreateUser } = await import('../pages/app/users')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <AdminCreateUser />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Pacotes',
    path: ROUTES.PACKAGES.LIST,
    lazy: async () => {
      const { PackagesList } = await import('../pages/app/packages')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <PackagesList />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Criar Pacote',
    path: ROUTES.PACKAGES.CREATE,
    lazy: async () => {
      const { CreatePackage } = await import('../pages/app/packages')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CreatePackage />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Editar Pacote',
    path: ROUTES.PACKAGES.EDIT_ROUTE,
    lazy: async () => {
      const { CreatePackage } = await import('../pages/app/packages')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <CreatePackage />
          </Suspense>
        )
      }
    }
  },
  {
    id: 'Log do Sistema',
    path: ROUTES.SYSTEM_LOGS.LIST,
    lazy: async () => {
      const { SystemLogsList } = await import('../pages/app/system-logs')
      return {
        element: (
          <Suspense fallback={<div>Carregando...</div>}>
            <SystemLogsList />
          </Suspense>
        )
      }
    }
  }
]
