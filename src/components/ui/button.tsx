import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variants = {
  primary: 'bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm hover:from-indigo-600 hover:to-violet-700 hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98]',
  secondary: 'bg-white text-zinc-700 border border-zinc-200 hover:bg-zinc-50 active:scale-[0.98] dark:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700 dark:hover:bg-zinc-700',
  ghost: 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 active:scale-[0.98] dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100',
  destructive: 'bg-rose-500 text-white shadow-sm hover:bg-rose-600 hover:shadow-md hover:shadow-rose-500/20 active:scale-[0.98]',
  outline: 'border-2 border-indigo-500 text-indigo-600 hover:bg-indigo-50 active:scale-[0.98] dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-500/10',
}

const sizes = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 justify-center',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="size-4 animate-spin" />}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    )
  }
)
Button.displayName = 'Button'
