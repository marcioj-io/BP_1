import { useMutation } from '@tanstack/react-query'

import { recoveryPassword } from '@/api/auth/recovery-password'

export const useRecoverPassword = () => {
  return useMutation({
    mutationFn: (body: { newPassword: string; accessToken: string }) =>
      recoveryPassword(body)
  })
}
