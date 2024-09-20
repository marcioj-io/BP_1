import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { IAssignment, UserStatusEnum } from '@/types'

import { admformSchema, AdminFormSchema } from '../formSchema'
import { useAdminUserData } from './useAdminUserData'

export const useAdminUserForm = (userId: string) => {
  const { user, assignments, sources } = useAdminUserData(userId)

  const form = useForm<AdminFormSchema>({
    resolver: zodResolver(admformSchema),
    defaultValues: {
      name: '',
      email: '',
      assignments: [],
      sources: [],
      status: UserStatusEnum.ACTIVE
    }
  })

  useEffect(() => {
    if (user) {
      form.reset({
        ...form.getValues(),
        name: user.name,
        email: user.email,
        assignments: user.assignments?.map((assignment: IAssignment) => ({
          ...assignment,
          assignmentId: assignment.id
        })),
        sources: user.sources?.map((searchSource) => searchSource.id),
        status: user.status
      })
    }
  }, [form, user])

  return { form, assignments, sources, user }
}
