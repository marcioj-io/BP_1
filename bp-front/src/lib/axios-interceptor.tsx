/* eslint-disable @typescript-eslint/no-explicit-any */
import axios, { AxiosResponse, InternalAxiosRequestConfig } from 'axios'
import { useAtomValue } from 'jotai'
import { ReactNode, useCallback, useEffect, useState } from 'react'

import { HTTP_STATUS_CODES, STORAGE_KEYS } from '@/constants'
import { env } from '@/env'
import { costCenterAtom } from '@/store/cost-center'
import { authAtom } from '@/store/user'

import { api } from './axios'
import { store } from './jotai'

const cleanInstance = axios.create()

export const AxiosInterceptor = ({ children }: { children: ReactNode }) => {
  const costCenter = useAtomValue(costCenterAtom)
  const [isReady, setIsReady] = useState<boolean>(false)

  // const fetchIP = async () => {
  //   const apis = [
  //     'https://api.ipify.org/?format=json',
  //     'https://api.bigdatacloud.net/data/client-ip'
  //   ]
  //   for (const api of apis) {
  //     try {
  //       const { data } = await axios.get(api)

  //       return data.ip || data.ipString || data.clientIp
  //     } catch (error) {
  //       console.error(`Failed to fetch IP from ${api}: ${error}`)
  //     }
  //   }
  //   throw new Error('All APIs failed to return the IP address')
  // }

  const unauthorized = useCallback(() => {
    store.set(authAtom, null)
  }, [])

  const refreshAccessToken = useCallback(
    async (ip: string) => {
      try {
        const URL = env.VITE_API_URL
        const refresh = localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN)

        const response = await cleanInstance.get(`${URL}/auth/refresh`, {
          headers: {
            Authorization: `Bearer ${refresh}`,
            'x-forwarded-for': ip
          }
        })

        if (response.status === 401) {
          throw new Error('Error refreshing')
        } else {
          const { accessToken, refreshToken } = response.data

          store.set(authAtom, (prev) => ({
            ...prev,
            token: accessToken,
            refreshToken: refreshToken,
            user: prev ? prev.user : null
          }))
        }
      } catch (error) {
        console.log('Error', error)
        unauthorized()
      }
    },
    [unauthorized]
  )

  useEffect(() => {
    let isMounted = true

    function setupInterceptors(ip?: string) {
      const interceptorRequest = api.interceptors.request.use(
        async (config: InternalAxiosRequestConfig) => {
          config.headers['accept-language'] = 'pt-BR'
          const auth = store.get(authAtom)

          if (ip) {
            config.headers['x-forwarded-for'] = ip
          }

          if (auth?.token) {
            config.headers.Authorization = `Bearer ${auth.token}`
          }

          if (costCenter) {
            config.headers['x-cost-center-id'] = costCenter
          }

          return config
        },
        (error: any) => {
          return Promise.reject(error)
        }
      )

      const interceptorResponse = api.interceptors.response.use(
        (response: AxiosResponse) => {
          return response
        },
        async (errorInterceptor: any) => {
          const originalRequest = errorInterceptor.config

          if (
            errorInterceptor.response &&
            errorInterceptor.response.status ===
              HTTP_STATUS_CODES.UNAUTHORIZED &&
            !originalRequest._retry
          ) {
            try {
              originalRequest._retry = true
              const isRefreshTokenAvailable = localStorage.getItem(
                STORAGE_KEYS.REFRESH_TOKEN
              )

              if (isRefreshTokenAvailable) {
                await refreshAccessToken(ip || '')
              }

              return api(originalRequest)
            } catch (refreshError) {
              console.log('Error refreshing access token', refreshError)
              unauthorized()
              throw refreshError
            }
          }
          return Promise.reject(errorInterceptor)
        }
      )

      setIsReady(true)

      return () => {
        isMounted = false
        api.interceptors.request.eject(interceptorRequest)
        api.interceptors.response.eject(interceptorResponse)
      }
    }

    if (isMounted) {
      setupInterceptors()
      setIsReady(true)
    }

    // fetchIP()
    //   .then((ip) => {})
    //   .catch((error) => {
    //     console.error('Error fetching IP:', error)
    //   })
  }, [refreshAccessToken, unauthorized])

  return isReady ? <>{children}</> : null
}
