import { useMutation } from '@tanstack/react-query'

import { editUser } from '@/api/users/edit-user'
import { IEditUserBody } from '@/types/modules/users/IEditUserBody'

export const useEditUser = () => {
  return useMutation({
    mutationFn: (body: IEditUserBody) => editUser(body)
  })
}
