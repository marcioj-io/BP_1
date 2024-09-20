import { useMutation } from '@tanstack/react-query'

import {
  IUpdateProfilePassword,
  updatePassword
} from '@/api/config/update-password'

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: (body: IUpdateProfilePassword) => updatePassword(body)
  })
}
