import queryString from 'query-string'
import { Suspense } from 'react'
import { Navigate, RouteObject } from 'react-router-dom'
import { QueryParamProvider } from 'use-query-params'
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6'

import { ROUTES } from '@/constants'
import { AuthLayout } from '@/layouts'
import { AxiosInterceptor } from '@/lib/axios-interceptor'
import Forbidden from '@/pages/forbidden'
import { IAuthUser } from '@/types'

import { adminRoutes } from './adminRoutes'
import { clientRoutes } from './clientRoutes'
import { RoutesGuard } from './privateRoute'
import { RoleEnum } from './rules'

export const useAppRoutes = ({ user }: { user: IAuthUser | null }) => {
  let userRoutes: RouteObject[] = []

  if (user?.role === RoleEnum.ADMIN) {
    userRoutes = adminRoutes
  } else {
    userRoutes = clientRoutes
  }

  const routes: RouteObject[] = [
    {
      path: '/',
      element: <RoutesGuard />,
      children: [
        {
          path: '/',
          element: <AuthLayout />,
          children: [
            {
              path: ROUTES.AUTH.LOGIN,
              lazy: async () => {
                const { Login } = await import('../pages/auth')
                return {
                  element: (
                    <Suspense fallback={<div>Carregando...</div>}>
                      <Login />
                    </Suspense>
                  )
                }
              }
            },
            {
              path: ROUTES.AUTH.FORGOT_PASSWORD,
              lazy: async () => {
                const { ForgotPassword } = await import('../pages/auth')
                return {
                  element: <ForgotPassword />
                }
              }
            },
            {
              path: ROUTES.AUTH.RECOVER_PASSWORD,
              lazy: async () => {
                const { RecoverPassword } = await import('../pages/auth')
                return {
                  element: <RecoverPassword />
                }
              }
            },
            {
              path: '/',
              element: <Navigate to={ROUTES.AUTH.LOGIN} />
            }
          ]
        },

        {
          path: '/',
          lazy: async () => {
            const { DashboardLayout } = await import('@/layouts')
            return {
              element: (
                <AxiosInterceptor>
                  <QueryParamProvider
                    adapter={ReactRouter6Adapter}
                    options={{
                      searchStringToObject: queryString.parse,
                      objectToSearchString: queryString.stringify
                    }}
                  >
                    <Suspense fallback={<div>Carregando...</div>}>
                      <DashboardLayout />
                    </Suspense>
                  </QueryParamProvider>
                </AxiosInterceptor>
              )
            }
          },
          children: [
            {
              id: 'Fonte de pesquisa',
              path: ROUTES.SOURCES.LIST,
              lazy: async () => {
                const { SourceList } = await import('../pages/app/sources')
                return {
                  element: (
                    <Suspense fallback={<div>Carregando...</div>}>
                      <SourceList />
                    </Suspense>
                  )
                }
              }
            },
            {
              id: 'Fonte de pesquisa - Novo Cadastro ',
              path: ROUTES.SOURCES.CREATE,
              lazy: async () => {
                const { CreateSource } = await import('../pages/app/sources')
                return {
                  element: (
                    <Suspense fallback={<div>Carregando...</div>}>
                      <CreateSource />
                    </Suspense>
                  )
                }
              }
            },
            {
              id: 'Fonte de Pesquisa - Editar',
              path: ROUTES.SOURCES.EDIT_ROUTE,
              lazy: async () => {
                const { CreateSource } = await import('../pages/app/sources')
                return {
                  element: (
                    <Suspense fallback={<div>Carregando...</div>}>
                      <CreateSource />
                    </Suspense>
                  )
                }
              }
            },
            ...userRoutes
          ]
        },
        {
          path: '*',
          element: <Forbidden />
        }
      ]
    }
  ]

  return { routes }
}
