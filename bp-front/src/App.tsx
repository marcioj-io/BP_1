import './assets/styles/global.css'

import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { Provider } from 'jotai'

import { ModalProvider } from './components/Modal'
import { ThemeProvider } from './components/theme-provider'
import { Toaster } from './components/ui/sonner'
import { store } from './lib/jotai'
import { queryClient } from './lib/query-client'
import { AppRoutesProvider } from './providers/AppRoutesProvider'

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Provider store={store}>
          <ModalProvider />
          <AppRoutesProvider />
          <Toaster richColors />
          <ReactQueryDevtools initialIsOpen={false} />
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  )
}
