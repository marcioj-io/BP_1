export interface ICostCenter {
  name: string
  description: string
  id: string
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  status: string
}

export enum CostCenterStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE'
}
