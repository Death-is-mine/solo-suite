'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { navigation } from '@/lib/navigation'
import { isFeatureEnabled, type FeatureFlagKey } from '@/lib/feature-flags'
import { useLayout } from './layout-context'
import { useSession } from 'next-auth/react'
import {
  LayoutDashboard, Users, Building2, FileText, Wallet, Briefcase,
  RotateCcw, File, Calendar, BarChart3, Zap, Settings,
  ExternalLink, Star, CheckSquare, Video, Folder, X, ShieldAlert, ChevronLeft, ChevronRight,
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
  const { isSidebarOpen, isMobileSidebarOpen, closeMobileSidebar, toggleSidebar } = useLayout()
  const { data: session } = useSession()

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center gap-2 border-b border-zinc-200/50 px-4 dark:border-zinc-800/50">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-sm shadow-indigo-500/20">
          <Briefcase className="size-4 text-white" />
        </div>
        {isSidebarOpen && (
          <span className="animate-fade-in truncate text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Solo Suite
          </span>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto overflow-x-hidden p-3 custom-scrollbar">
        {navigation.map((section, idx) => {
          const visibleItems = section.items.filter(
            (item) => !item.featureFlag || isFeatureEnabled(item.featureFlag as FeatureFlagKey)
          )
          if (visibleItems.length === 0) return null
          return (
            <div key={section.title} className={`mb-5 ${idx > 0 ? 'mt-5' : ''}`}>
              {isSidebarOpen ? (
                <p className="animate-fade-in mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                  {section.title}
                </p>
              ) : (
                <div className="mx-auto mb-2 h-px w-6 bg-zinc-200 dark:bg-zinc-800" />
              )}
              
              <div className="space-y-1">
                {visibleItems.map((item) => {
                  const Icon = iconMap[item.icon]
                  const isActive = pathname.startsWith(item.href)
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={!isSidebarOpen ? item.title : undefined}
                      className={`group relative flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm transition-all duration-200 ${
                        isActive
                          ? 'bg-indigo-50/50 font-medium text-indigo-900 dark:bg-indigo-500/10 dark:text-indigo-300'
                          : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50'
                      }`}
                    >
                      {isActive && (
                        <span className="absolute inset-y-1 left-0 w-1 rounded-r-md bg-indigo-500 dark:bg-indigo-400" />
                      )}
                      {Icon && (
                        <Icon 
                          className={`size-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? 'text-indigo-600 dark:text-indigo-400' : ''
                          }`} 
                        />
                      )}
                      {isSidebarOpen && (
                        <span className="truncate">{item.title}</span>
                      )}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </nav>
      
      <div className="mt-auto border-t border-zinc-200/50 p-3 dark:border-zinc-800/50">
        <Link
          href="/health"
          title={!isSidebarOpen ? 'Workspace Health' : undefined}
          className="group flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800/50 dark:hover:text-zinc-50"
        >
          <ShieldAlert className="size-4 shrink-0 transition-transform duration-200 group-hover:scale-110" />
          {isSidebarOpen && <span className="truncate">Workspace Health</span>}
        </Link>
        
        {isSidebarOpen && (
          <div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-200/50 bg-zinc-50 p-3 dark:border-zinc-800/50 dark:bg-zinc-900/50">
            <div className="relative">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-zinc-200 font-medium text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                {session?.user?.name?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-white bg-emerald-500 dark:border-zinc-900" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                {session?.user?.name || 'User'}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-400">Owner</p>
            </div>
          </div>
        )}
      </div>

      <button 
        onClick={toggleSidebar}
        className="absolute -right-3 top-16 hidden size-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-400 shadow-sm transition-colors hover:text-zinc-900 md:flex dark:border-zinc-700 dark:bg-zinc-800 dark:hover:text-zinc-50"
      >
        {isSidebarOpen ? <ChevronLeft className="size-3" /> : <ChevronRight className="size-3" />}
      </button>
    </div>
  )

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-zinc-950/50 backdrop-blur-sm transition-opacity md:hidden"
          onClick={closeMobileSidebar}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex h-full flex-col border-r border-zinc-200/50 bg-white/80 backdrop-blur-xl transition-all duration-300 ease-in-out md:static dark:border-zinc-800/50 dark:bg-zinc-950/80 ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } ${isSidebarOpen ? 'w-64' : 'w-16'}`}
      >
        {isMobileSidebarOpen && (
          <button 
            onClick={closeMobileSidebar}
            className="absolute right-4 top-4 rounded-md p-1 text-zinc-400 hover:bg-zinc-100 md:hidden dark:hover:bg-zinc-800"
          >
            <X className="size-5" />
          </button>
        )}
        {sidebarContent}
      </aside>
    </>
  )
}
