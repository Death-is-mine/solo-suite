import Link from 'next/link'

interface ComingSoonProps {
  title: string
  description?: string
  estimatedRelease?: string
}

export function ComingSoon({ title, description, estimatedRelease }: ComingSoonProps) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-4 inline-flex size-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
          <span className="text-2xl">⌛</span>
        </div>
        <h1 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          {title}
        </h1>
        {description && (
          <p className="mb-6 text-zinc-500 dark:text-zinc-400">
            {description}
          </p>
        )}
        {estimatedRelease && (
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            Estimated release: {estimatedRelease}
          </p>
        )}
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  )
}
