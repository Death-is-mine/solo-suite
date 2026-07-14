export interface CalendarAdapter {
  createEvent(event: CalendarEvent): Promise<string>
  updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<void>
  deleteEvent(eventId: string): Promise<void>
  listEvents(start: string, end: string): Promise<CalendarEvent[]>
  createMeetingLink(title: string): Promise<string>
}

export interface CalendarEvent {
  summary: string
  description?: string
  start: { dateTime: string; timeZone: string }
  end: { dateTime: string; timeZone: string }
  attendees?: string[]
  conferenceData?: { createRequest: boolean }
}
