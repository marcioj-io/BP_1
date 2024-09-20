import { useAtomValue } from 'jotai'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { authAtom } from '@/store/user'

import { useAppRoutes } from '../routes'

export const AppRoutesProvider = () => {
  const auth = useAtomValue(authAtom)

  const { routes } = useAppRoutes({ user: auth?.user ?? null })
  const router = createBrowserRouter(routes)

  return <RouterProvider router={router} />
}
