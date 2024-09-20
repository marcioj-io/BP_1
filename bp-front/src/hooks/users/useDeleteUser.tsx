import { useMutation } from '@tanstack/react-query'

import { deleteUser, IDeleteUserParams } from '@/api/users/delete-user'

export const useDeleteUser = () => {
  return useMutation({
    mutationFn: (params: IDeleteUserParams) => deleteUser(params)
  })
}
