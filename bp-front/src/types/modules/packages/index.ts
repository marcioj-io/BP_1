export enum StatusEnum {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING'
}

export enum SimpleFormEnum {
  ACTIVE = 'true',
  INACTIVE = 'false'
}

export type IPackages = {
  id: string
  version: number
  status: StatusEnum
  name: string
  deliveryForecastInDays: number
  simpleForm: boolean
  notes: string
}

export type IPriceRange = {
  id: string
  version?: string
  amount: number
  price: string
}

export type IPackage = {
  id: string
  version: number
  status: StatusEnum
  name: string
  deliveryForecastInDays: number
  simpleForm: boolean
  notes: string
  PriceRange: IPriceRange[]
  Sources: [
    {
      id: string
      name: string
    }
  ]
}

export type ICreatePackageBody = {
  name: string
  deliveryForecastInDays: number
  simpleForm: boolean
  notes: string
  clientId: string
  priceRanges: {
    amount: number
    price: number
  }[]
  sources: {
    id: string
  }[]
  meta?: {
    total: number
    lastPage: number
    currentPage: number
    perPage: number
    prev: number
    next: number
  }
}

export type IUpdatePackageBody = {
  version: number
  name: string
  deliveryForecastInDays: number
  simpleForm: boolean
  notes: string
  clientId: string
  priceRanges: {
    id?: string
    version?: string
    amount: number
    price: number
  }[]
  sources: {
    id: string
  }[]
  meta?: {
    total: number
    lastPage: number
    currentPage: number
    perPage: number
    prev: number
    next: number
  }
}
