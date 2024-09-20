import { UserStatusEnum } from '.'

export interface IAssignment {
  assignmentId: string
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export interface ICreateUserBody {
  name: string
  email: string
  assignments: IAssignment[]
  costCenters?: string[]
  sources?: string[]
  roleId: string
  status: UserStatusEnum
  clientId?: string
}
