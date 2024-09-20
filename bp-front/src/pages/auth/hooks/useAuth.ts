import { useMutation } from '@tanstack/react-query'
import { useSetAtom } from 'jotai'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

import { getProfile } from '@/api/auth/get-profile'
import { signIn } from '@/api/auth/sign-in'
import { ROUTES } from '@/constants'
import { authAtom } from '@/store/user'

type ILogin = {
  email: string
  password: string
}

export const useAuth = () => {
  const navigate = useNavigate()

  const setAuth = useSetAtom(authAtom)

  const [isLoading, setIsLoading] = useState(false)

  const { mutateAsync: authenticateUser, isError } = useMutation({
    mutationFn: (login: ILogin) => signIn(login)
  })

  const login = async (user: ILogin) => {
    try {
      setIsLoading(true)
      const { accessToken, refreshToken } = await authenticateUser(user)
      const authUser = await getProfile(accessToken)

      setAuth({ token: accessToken, refreshToken, user: authUser })

      navigate(ROUTES.DASHBOARD.HOME)
      toast.success('Bem vindo!')
      setIsLoading(false)
    } catch (error: unknown) {
      setIsLoading(false)
    }
  }

  return { login, isLoading, isError }
}
