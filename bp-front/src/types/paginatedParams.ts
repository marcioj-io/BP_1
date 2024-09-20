export enum OrderEnum {
  ASC = 'asc',
  DESC = 'desc'
}

export interface IPaginatedParams {
  page?: number
  perPage?: number
  orderBy?: string
  order?: OrderEnum
}
