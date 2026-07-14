import type { NavSection } from '@/types/navigation'

export const navigation: NavSection[] = [
  {
    title: 'Overview',
    items: [{ title: 'Dashboard', href: '/dashboard', icon: 'layout-dashboard' }],
  },
  {
    title: 'Revenue',
    items: [
      { title: 'Leads', href: '/leads', icon: 'users' },
      { title: 'Clients', href: '/clients', icon: 'building-2' },
      { title: 'Agreements', href: '/agreements', icon: 'file-text' },
      { title: 'Finance & Accounting', href: '/finance', icon: 'wallet' },
      { title: 'Projects', href: '/projects', icon: 'briefcase' },
      { title: 'Retainers', href: '/retainers', icon: 'rotate-ccw' },
    ],
  },
  {
    title: 'Execution',
    items: [
      { title: 'Tasks', href: '/tasks', icon: 'check-square' },
      { title: 'Meetings', href: '/meetings', icon: 'video' },
      { title: 'Files', href: '/files', icon: 'folder' },
      { title: 'Documents', href: '/documents', icon: 'file' },
      { title: 'Calendar', href: '/calendar', icon: 'calendar' },
    ],
  },
  {
    title: 'Operations',
    items: [
      { title: 'Reports', href: '/reports', icon: 'bar-chart-3' },
      { title: 'Automation', href: '/automation', icon: 'zap' },
      { title: 'Workspace', href: '/workspace', icon: 'settings' },
    ],
  },
  {
    title: 'Client',
    items: [
      { title: 'Client Portal', href: '/portal', icon: 'external-link' },
      { title: 'Reviews', href: '/reviews', icon: 'star' },
    ],
  },
]
