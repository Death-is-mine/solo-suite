interface ProgressBarProps {
  value?: number
  progress?: number
  max?: number
  label?: string
  showValue?: boolean
  size?: 'sm' | 'md' | 'lg'
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'blue' | 'purple' | 'cyan'
  colorClass?: string
}

const sizes = {
  sm: 'h-1.5',
  md: 'h-2.5',
  lg: 'h-4',
}

const colors = {
  indigo: 'from-indigo-500 to-violet-500',
  emerald: 'from-emerald-400 to-emerald-600',
  amber: 'from-amber-400 to-amber-600',
  rose: 'from-rose-400 to-rose-600',
  sky: 'from-sky-400 to-sky-600',
  blue: 'from-blue-400 to-blue-600',
  purple: 'from-purple-400 to-purple-600',
  cyan: 'from-cyan-400 to-cyan-600',
}

export function ProgressBar({ 
  value, 
  progress,
  max = 100, 
  label, 
  showValue = false,
  size = 'md',
  color = 'indigo',
  colorClass,
}: ProgressBarProps) {
  const raw = value ?? progress ?? 0
  const percentage = Math.min(Math.max((raw / max) * 100, 0), 100)

  const barColor = colorClass ?? `bg-gradient-to-r ${colors[color]}`

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between text-xs">
          {label && <span className="font-medium text-zinc-700 dark:text-zinc-300">{label}</span>}
          {showValue && <span className="text-zinc-500 dark:text-zinc-400">{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className={`w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 ${sizes[size]}`}>
        <div 
          className={`h-full rounded-full transition-all duration-1000 ease-out ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
