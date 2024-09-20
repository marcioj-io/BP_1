import { motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'

import logo from '@/assets/images/logo.svg'

export const AuthLayout = () => {
  const { pathname } = useLocation()

  return (
    <div className="grid min-h-screen grid-cols-[45%_55%]">
      <div className="flex h-full items-center justify-center gap-3 border-r border-foreground/5 bg-brand-secondary p-10 text-lg text-foreground">
        <img src={logo} alt="logo" />
      </div>
      <div className="flex w-full items-center justify-center">
        <motion.div
          key={pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Outlet />
        </motion.div>
      </div>
    </div>
  )
}
