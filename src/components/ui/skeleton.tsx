type SkeletonProps = React.HTMLAttributes<HTMLDivElement>

export function Skeleton({ className = '', ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-shimmer rounded-md bg-zinc-200/50 bg-[length:400%_100%] bg-gradient-to-r from-zinc-200/50 via-zinc-100/50 to-zinc-200/50 dark:bg-zinc-800/50 dark:from-zinc-800/50 dark:via-zinc-700/50 dark:to-zinc-800/50 ${className}`}
      {...props}
    />
  )
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 ${className}`}>
      <div className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-xl" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <div className="mt-6 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-4/6" />
      </div>
    </div>
  )
}
