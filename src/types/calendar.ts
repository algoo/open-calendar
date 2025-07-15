import type { IcsCalendar, IcsEvent, IcsRecurrenceId } from 'ts-ics'
import type { DAVCalendar } from 'tsdav'

// TODO - CJ - 2025-07-03 - add <TCalendarUid = any> generic
// TODO - CJ - 2025-07-03 - add options to support IcsEvent custom props
export type Calendar = DAVCalendar & {
  // INFO - CJ - 2025-07-03 - Useful fields from 'DAVCalendar'
  // ctag?: string
  // description?: string;
  // displayName?: string | Record<string, unknown>;
  // calendarColor?: string
  // url: string
  // fetchOptions?: RequestInit
  headers?: Record<string, string>
  uid?: unknown
}

export type CalendarObject = {
  data: IcsCalendar
  etag?: string
  url: string
  calendarUrl: string
}

export type CalendarEvent = {
  calendarUrl: string
  event: IcsEvent
}

export type EventUid = {
  uid: string
  recurrenceId?: IcsRecurrenceId
}

export type DisplayedCalendarEvent = {
  calendarUrl: string
  event: IcsEvent
  recurringEvent?: IcsEvent
}
