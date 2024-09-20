import { api } from '@/lib/axios'

export const recoveryPassword = async ({
  newPassword,
  accessToken
}: {
  newPassword: string
  accessToken: string
}) => {
  const body = {
    newPassword,
    accessToken
  }
  const { data } = await api.patch(`/auth/recovery/password`, body)
  return data
}
