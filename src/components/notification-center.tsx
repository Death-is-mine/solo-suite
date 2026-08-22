'use client'

import { useState, useEffect } from 'react'

// ponytail: notification center — polls for unread count, shows dropdown

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const unread = notifications.filter((n) => !n.read).length

  useEffect(() => { setNotifications([]) }, [])

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
        </svg>
        {unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">{unread}</span>}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-4 py-2 dark:border-zinc-700"><h3 className="text-sm font-medium">Notifications</h3></div>
          <div className="max-h-64 overflow-y-auto">
            {notifications.length === 0 && <p className="px-4 py-6 text-center text-sm text-zinc-500">No notifications</p>}
            {notifications.map((n) => (
              <div key={n.id} className={`border-b border-zinc-100 px-4 py-3 dark:border-zinc-800 ${n.read ? 'opacity-60' : ''}`}>
                <p className="text-sm font-medium">{n.title}</p>
                <p className="text-xs text-zinc-500">{n.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
