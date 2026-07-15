import { forwardRef } from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean
  hover?: boolean
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glass = false, hover = false, children, ...props }, ref) => {
    const baseStyle = "rounded-2xl border p-5 shadow-sm transition-all duration-200"
    const bgStyle = glass 
      ? "glass-card" 
      : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
    const hoverStyle = hover 
      ? "hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md dark:hover:border-indigo-900" 
      : ""

    return (
      <div 
        ref={ref}
        className={`${baseStyle} ${bgStyle} ${hoverStyle} ${className}`}
        {...props}
      >
        {children}
      </div>
    )
  }
)
Card.displayName = 'Card'
