import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'

import { UserStatusEnum } from '@/types'

import { FormSchema, formSchema } from '../formSchema'
import { useUserData } from './useUserData'

export const useUserForm = (userId: string) => {
  const { user, assignments, costCenters } = useUserData(userId)

  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      assignments: [],
      costCenters: [],
      status: UserStatusEnum.ACTIVE
    }
  })

  useEffect(() => {
    if (user) {
      form.reset({
        ...form.getValues(),
        name: user.name,
        email: user.email,
        assignments: user.assignments?.map((assignment) => ({
          ...assignment,
          assignmentId: assignment.id
        })),
        costCenters: user.costCenters?.map((costCenter) => costCenter.id),
        status: user.status
      })
    }
  }, [form, user])

  return { form, assignments, costCenters, user }
}
