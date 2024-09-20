import { useMutation } from '@tanstack/react-query'

import { IUpdateProfileBody, updateProfile } from '@/api/config/update-profile'

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: (body: IUpdateProfileBody) => updateProfile(body)
  })
}
