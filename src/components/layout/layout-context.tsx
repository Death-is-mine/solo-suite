'use client'

import { createContext, useContext, useState, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

interface LayoutContextValue {
  isSidebarOpen: boolean
  isMobileSidebarOpen: boolean
  toggleSidebar: () => void
  toggleMobileSidebar: () => void
  closeMobileSidebar: () => void
}

const LayoutContext = createContext<LayoutContextValue | undefined>(undefined)

export function useLayout() {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const pathname = usePathname()

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev)
  const toggleMobileSidebar = () => setIsMobileSidebarOpen((prev) => !prev)
  const closeMobileSidebar = () => setIsMobileSidebarOpen(false)

  const [prevPathname, setPrevPathname] = useState(pathname)

  // Close mobile sidebar on route change (Derived state pattern)
  if (pathname !== prevPathname) {
    setPrevPathname(pathname)
    setIsMobileSidebarOpen(false)
  }
  return (
    <LayoutContext.Provider
      value={{
        isSidebarOpen,
        isMobileSidebarOpen,
        toggleSidebar,
        toggleMobileSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </LayoutContext.Provider>
  )
}
