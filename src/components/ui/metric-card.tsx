import { Card } from './card'

interface MetricCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  trend?: string | {
    value: number
    label: string
    positive?: boolean
  }

  accentColor?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'sky' | 'zinc' | 'blue' | 'purple' | 'cyan'
  delay?: number
}

const accentStyles: Record<string, string> = {
  indigo: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50',
  emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
  amber: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50',
  rose: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50',
  sky: 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/50',
  zinc: 'text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50',
  blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
  purple: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
  cyan: 'text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-950/50',
}

export function MetricCard({ 
  label, 
  value, 
  icon, 
  trend, 

  accentColor = 'indigo',
  delay = 1 
}: MetricCardProps) {
  const accent = accentStyles[accentColor] ?? accentStyles.indigo

  const isStructuredTrend = typeof trend === 'object' && trend !== null
  const isStringTrend = typeof trend === 'string'

  return (
    <Card 
      glass 
      hover
      className={`animate-slide-up opacity-0 delay-${delay}`}
    >
      <div className="flex items-center justify-between">
        <div className={`flex size-10 items-center justify-center rounded-xl ${accent}`}>
          {icon}
        </div>
        {isStructuredTrend && (
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
            trend.positive 
              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
              : 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400'
          }`}>
            {trend.positive ? '+' : ''}{trend.value}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</h3>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          {value}
        </p>
        {isStructuredTrend && (
          <p className="mt-1 text-xs text-zinc-400">
            {trend.label}
          </p>
        )}
        {isStringTrend && (
          <p className="mt-1 text-xs text-zinc-400">
            {trend}
          </p>
        )}
      </div>
    </Card>
  )
}
