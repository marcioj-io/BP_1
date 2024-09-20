import { useAtomValue } from 'jotai'
import { Navigate, Outlet, useLocation } from 'react-router-dom'

import { ROUTES } from '@/constants'
import { authAtom } from '@/store/user'

import { RoleEnum } from './rules'

type TPrivateRouteProps = {
  requiredLevel?: RoleEnum
}

export const RoutesGuard = ({
  children
}: React.PropsWithChildren<TPrivateRouteProps>) => {
  const { pathname } = useLocation()
  const auth = useAtomValue(authAtom)

  const userHasToken = auth?.token && auth.refreshToken
  const redirectToLogin = <Navigate to={ROUTES.AUTH.LOGIN} />
  const redirectToHome = <Navigate to={ROUTES.DASHBOARD.HOME} />

  if (userHasToken && pathname.startsWith('/auth')) {
    return redirectToHome
  }

  if (!userHasToken && pathname.startsWith('/auth')) {
    return children || <Outlet />
  }

  if (!userHasToken && pathname.includes('/admin')) {
    return redirectToLogin
  }

  return children || <Outlet />
}
