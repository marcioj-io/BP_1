import { useMutation } from '@tanstack/react-query'

import { createUser } from '@/api/users/create-user'
import { ICreateUserBody } from '@/types/modules/users/ICreateUserBody'

export const useCreateUser = () => {
  return useMutation({
    mutationFn: (body: ICreateUserBody) => createUser(body)
  })
}
