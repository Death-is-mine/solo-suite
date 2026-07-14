export interface NavItem {
  title: string
  href: string
  icon: string
  badge?: string
  featureFlag?: string
  children?: NavItem[]
}

export type NavSection = {
  title: string
  items: NavItem[]
}
