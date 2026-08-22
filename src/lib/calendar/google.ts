import type { CalendarAdapter, CalendarEvent } from './index'

// ponytail: Google Calendar adapter via REST API. Stub — swap in real API calls when env vars are set.

const API_BASE = 'https://www.googleapis.com/calendar/v3'

async function gcalFetch(path: string, options?: RequestInit) {
  const apiKey = process.env.GOOGLE_CALENDAR_API_KEY
  if (!apiKey) throw new Error('GOOGLE_CALENDAR_API_KEY not set')
  return fetch(`${API_BASE}${path}?key=${apiKey}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
  })
}

export const googleCalendarAdapter: CalendarAdapter = {
  async createEvent(event: CalendarEvent): Promise<string> {
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary'
    const res = await gcalFetch(`/calendars/${encodeURIComponent(calendarId)}/events`, {
      method: 'POST',
      body: JSON.stringify(event),
    })
    if (!res.ok) throw new Error(`Calendar create failed: ${res.status}`)
    const data = await res.json()
    return data.id
  },

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void> {
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary'
    const res = await gcalFetch(`/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
      method: 'PATCH',
      body: JSON.stringify(event),
    })
    if (!res.ok) throw new Error(`Calendar update failed: ${res.status}`)
  },

  async deleteEvent(eventId: string): Promise<void> {
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary'
    const res = await gcalFetch(`/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error(`Calendar delete failed: ${res.status}`)
  },

  async listEvents(start: string, end: string): Promise<CalendarEvent[]> {
    const calendarId = process.env.GOOGLE_CALENDAR_ID ?? 'primary'
    const res = await gcalFetch(
      `/calendars/${encodeURIComponent(calendarId)}/events?timeMin=${start}&timeMax=${end}&singleEvents=true&orderBy=startTime`
    )
    if (!res.ok) throw new Error(`Calendar list failed: ${res.status}`)
    const data = await res.json()
    return (data.items ?? []).map((item: Record<string, unknown>) => ({
      summary: item.summary as string,
      description: item.description as string | undefined,
      start: item.start as CalendarEvent['start'],
      end: item.end as CalendarEvent['end'],
    }))
  },

  async createMeetingLink(title: string): Promise<string> {
    console.log(`[calendar] meeting link requested: ${title}`)
    return `https://meet.google.com/placeholder-${Date.now()}`
  },
}
