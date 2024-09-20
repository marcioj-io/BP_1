import { api } from '@/lib/axios'

export interface SignInBody {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
}

export async function signIn(body: SignInBody): Promise<AuthResponse> {
  const { data } = await api.post('/auth/login', body)
  return data
}
