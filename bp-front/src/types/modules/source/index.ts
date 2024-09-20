export enum SourceStatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export enum ApplicationEnum {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  BOTH = 'BOTH'
}
export interface ISourceBody {
  name: string
  application: ApplicationEnum
  requiredFieldsPJ: string[]
  requiredFieldsPF: string[]
  requiredFieldsGeral: string[]
  extraInformation: string[]
  description: string
  unitCost: string | number
  validityInDays: string | number
  version?: number
  meta?: {
    total: number
    lastPage: number
    currentPage: number
    perPage: number
    prev: number
    next: number
  }
}

export type ISource = {
  name: string
  application: ApplicationEnum
  requiredFieldsPJ: string[]
  requiredFieldsPF: string[]
  requiredFieldsGeral: string[]
  extraInformation: string[]
  description: string
  unitCost: string | number
  validityInDays: string | number
  id: string
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string
  meta?: {
    total: number
    lastPage: number
    currentPage: number
    perPage: number
    prev: number
    next: number
  }
  status: SourceStatusEnum
}

export interface ISourcePagination {
  data: ISource[]
  total: number
  meta?: {
    total: number
    lastPage: number
    currentPage: number
    perPage: number
    prev: number
    next: number
  }
}
