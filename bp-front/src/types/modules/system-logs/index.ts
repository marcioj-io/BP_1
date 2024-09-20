export enum SystemLogsStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export enum SystemLogsTypeEnum {
  SYSTEM = 'SYSTEM',
  RESEARCH = 'RESEARCH'
}

export const SystemLogsTypeEnumLabel = {
  [SystemLogsTypeEnum.SYSTEM]: 'Sistema',
  [SystemLogsTypeEnum.RESEARCH]: 'Pesquisa'
} as const

export type ISystemLogs = {
  id: string
  ip: null
  event: string
  additionalData: { [key: string]: string }
  description: string
  type: SystemLogsTypeEnum
  userName: string
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  status: SystemLogsStatusEnum
}

export interface ISystemLogsPagination {
  data: ISystemLogs[]
  total: number
}
