export type IAssignment = {
  id: string
  name: string
  create?: boolean
  read?: boolean
  update?: boolean
  delete?: boolean
}

export type IRole = {
  id: string
  name: string
}

export enum UserStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export interface ICostCenters {
  id: string
  name: string
}

export interface ISearchSources {
  id: string
  name: string
}

export type IUser = {
  id: string
  rolesIds: string[]
  status: UserStatusEnum
  email: string
  name: string
  assignments: IAssignment[] | undefined
  blocked?: boolean
  createdAt: string
  role: IRole
  costCenters: ICostCenters[]
  version: number
  sources?: ISearchSources[]
}

export type UserAssignment = {
  id: string
  name: string
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export type UserRole = {
  id: string
  name: string
}

export type TGetUserResponse = {
  role: UserRole
  assignments: UserAssignment[]
  blocked: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string
  email: string
  id: string
  ip: string
  name: string
  status: string
  version: number
}

export type TAssignmentForValidate = {
  assignment: string
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export type TAssignmentWithoutAssignmentName = {
  create: boolean
  read: boolean
  update: boolean
  delete: boolean
}

export type TValidateAssignment = {
  assignment: string
  typePermission?: 'create' | 'delete' | 'read' | 'update'
  assignments?: TAssignmentForValidate[]
}
