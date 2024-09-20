import { useMutation } from '@tanstack/react-query'

import { IUpdateAvatar, updateAvatar } from '@/api/config/update-avatar'

export const useUpdateAvatar = () => {
  return useMutation({
    mutationFn: (content: IUpdateAvatar) => updateAvatar(content)
  })
}
