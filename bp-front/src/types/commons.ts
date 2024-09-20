export type IOptionValue = {
  id: string
  value: string
}

export type ISelectOptions = {
  label: string
  value: string
}

export type ITable = {
  total: number
  qtdPage: number
}

export type IFilter = {
  perPage?: number
  qtdPerPage?: number
  search?: unknown | null
}

export type IDefaultHook = {
  initialRequests?: boolean
  id?: string
}
