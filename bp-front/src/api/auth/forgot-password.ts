import { api } from '@/lib/axios'

export async function forgotPassword(body: { email: string }) {
  const { data } = await api.post(`/auth/forgot/password`, body)

  return data
}
