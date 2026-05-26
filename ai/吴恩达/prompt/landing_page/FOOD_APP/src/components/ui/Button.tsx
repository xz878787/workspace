import { motion } from 'framer-motion'
import { type ReactNode } from 'react'

type Variant = 'primary' | 'secondary' | 'outline'

interface ButtonProps {
  children: ReactNode
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  onClick?: () => void
  disabled?: boolean
}

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-orange-500 text-white hover:bg-orange-600 active:bg-orange-700 shadow-lg shadow-orange-500/25',
  secondary:
    'bg-gray-900 text-white hover:bg-gray-800 active:bg-gray-950 shadow-lg shadow-gray-900/20',
  outline:
    'border-2 border-white text-white hover:bg-white hover:text-gray-900 active:bg-gray-100',
}

const sizeStyles: Record<string, string> = {
  sm: 'px-5 py-2.5 text-sm',
  md: 'px-7 py-3 text-base',
  lg: 'px-9 py-4 text-lg',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      className={`
        inline-flex items-center justify-center rounded-2xl font-semibold
        cursor-pointer transition-colors duration-200
        focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-500/40
        ${variantStyles[variant]} ${sizeStyles[size]} ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  )
}
