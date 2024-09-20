import { Modules } from '@/routes/rules'
import { IUser } from '@/types'

export const userHasPermission = ({
  module,
  user
}: {
  module: Modules
  user: IUser
}) => {
  console.log('🔥 ~ user:', user)
  console.log('🔥 ~ module:', module)
  // if (!user) return false
  // const userAssignments = user.assignments
  // if (!userAssignments) return false
  // return userAssignments.some(
  //   (assignment) => assignment.assignmentId === rules[module]
  // )
}
