import { Eye, EyeOff, Lock } from 'lucide-react'
import React, { useState } from 'react'

import { cn } from '@/lib/utils'

import { Input } from './input'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const PasswordInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false)

    return (
      <div className="relative text-neutral-600">
        <div className="absolute left-4 top-1/2 z-10 -translate-y-1/2 transform">
          <Lock className="h-5 w-5" />
        </div>

        <Input
          ref={ref}
          {...props}
          type={!showPassword ? 'password' : 'text'}
          className={cn('px-[calc(1rem+20px+8px)]', className)}
        />

        <div
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 transform cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? (
            <Eye className="h-5 w-5" />
          ) : (
            <EyeOff className="h-5 w-5" />
          )}
        </div>
      </div>
    )
  }
)

PasswordInput.displayName = 'PasswordInput'

export { PasswordInput }
