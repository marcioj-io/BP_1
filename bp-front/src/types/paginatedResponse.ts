export type TTableMeta = {
  total: number
  lastPage: number
  page: number
  perPage: number
  prev: number
  next: number
}

export interface IPaginatedResponse<TData> {
  data: TData
  meta: TTableMeta
}
