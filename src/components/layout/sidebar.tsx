'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation } from '@/lib/navigation'
import { isFeatureEnabled, type FeatureFlagKey } from '@/lib/feature-flags'
import {
  LayoutDashboard, Users, Building2, FileText, Wallet, Briefcase,
  RotateCcw, File, Calendar, BarChart3, Zap, Settings,
  ExternalLink, Star, CheckSquare, Video, Folder,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  'users': Users,
  'building-2': Building2,
  'file-text': FileText,
  'wallet': Wallet,
  'briefcase': Briefcase,
  'rotate-ccw': RotateCcw,
  'file': File,
  'calendar': Calendar,
  'bar-chart-3': BarChart3,
  'zap': Zap,
  'settings': Settings,
  'external-link': ExternalLink,
  'star': Star,
  'check-square': CheckSquare,
  'video': Video,
  'folder': Folder,
}

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
      <div className="flex h-14 items-center gap-2 border-b border-zinc-200 px-4 dark:border-zinc-800">
        <Briefcase className="size-5 text-zinc-900 dark:text-zinc-50" />
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
          Solo Suite
        </span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3">
        {navigation.map((section) => {
          const visibleItems = section.items.filter(
            (item) => !item.featureFlag || isFeatureEnabled(item.featureFlag as FeatureFlagKey)
          )
          if (visibleItems.length === 0) return null
          return (
            <div key={section.title} className="mb-4">
              <p className="mb-1 px-2 text-xs font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                {section.title}
              </p>
              {visibleItems.map((item) => {
                const Icon = iconMap[item.icon]
                const isActive = pathname.startsWith(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors ${
                      isActive
                        ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                        : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50'
                    }`}
                  >
                    {Icon && <Icon className="size-4 shrink-0" />}
                    <span>{item.title}</span>
                  </Link>
                )
              })}
            </div>
          )
        })}
      </nav>
      <div className="border-t border-zinc-200 p-3 dark:border-zinc-800">
        <Link
          href="/health"
          className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
        >
          <Settings className="size-4" />
          <span>Workspace Health</span>
        </Link>
      </div>
    </aside>
  )
}
