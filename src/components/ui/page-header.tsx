import React from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  eyebrow?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, eyebrow, children }: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-fade-in">
      <div>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex shrink-0 items-center gap-3">
          {children}
        </div>
      )}
    </header>
  )
}
