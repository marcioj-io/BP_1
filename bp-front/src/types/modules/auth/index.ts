import { RoleEnum } from '@/routes/rules'

type Assignments = 'COMPANY' | 'USER'

export type IAuthAssignments = {
  assignment: Assignments
  create: boolean
  delete: boolean
  read: boolean
  update: boolean
}

export type IAuthUser = {
  sub: string
  id: string
  name: string
  email: string
  loginAttempts: number
  status: 'ACTIVE' | 'INACTIVE'
  blocked: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  version: number
  avatar?: string | null
  assignments: IAuthAssignments[]
  role: RoleEnum
  ip: string | null
  refreshToken: string
  recoveryToken: string | null
  mediaId: string | null
  roleId: string
  clientId: string | null
}
