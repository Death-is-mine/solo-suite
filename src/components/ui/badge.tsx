import React from 'react'

export type BadgeVariant = 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'primary'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  dot?: boolean
}

const variants = {
  neutral: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  error: 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400',
  primary: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400',
}

const dots = {
  neutral: 'bg-zinc-500',
  success: 'bg-emerald-500',
  warning: 'bg-amber-500',
  error: 'bg-rose-500',
  info: 'bg-sky-500',
  primary: 'bg-indigo-500',
}

export function Badge({ variant = 'neutral', dot = false, className = '', children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium transition-colors ${variants[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`size-1.5 rounded-full ${dots[variant]}`} />}
      {children}
    </span>
  )
}
