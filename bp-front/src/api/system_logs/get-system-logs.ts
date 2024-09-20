import { api } from '@/lib/axios'
import { ISystemLogs } from '@/types/modules/system-logs'
import { IPaginatedParams } from '@/types/paginatedParams'
import { IPaginatedResponse } from '@/types/paginatedResponse'

export interface IGetSystemLogsParams extends IPaginatedParams {
  search?: string
  clientId: string
}

export async function getSystemLogs(params: IGetSystemLogsParams) {
  const { data } = await api.get<IPaginatedResponse<ISystemLogs[]>>(
    `/event-logs`,
    {
      params
    }
  )
  return data
}
