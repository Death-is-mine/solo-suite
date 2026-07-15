import React from 'react'

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-6 py-16 text-center animate-fade-in dark:border-zinc-800 dark:bg-zinc-900/20">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-600 dark:text-zinc-400">
        {icon}
      </div>
      <h3 className="mb-1 text-sm font-semibold text-zinc-900 dark:text-white">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm text-zinc-600 dark:text-zinc-400 dark:text-zinc-400">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
