import { useMutation } from '@tanstack/react-query'

import { forgotPassword } from '@/api/auth/forgot-password'

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (body: { email: string }) => forgotPassword(body)
  })
}
