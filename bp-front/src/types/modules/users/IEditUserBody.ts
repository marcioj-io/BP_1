import { ICreateUserBody } from './ICreateUserBody'

export interface IEditUserBody extends Omit<ICreateUserBody, 'status'> {
  id: string
  version: number
}
