import type { IcsCalendar, IcsEvent, IcsRecurrenceId } from 'ts-ics'
import type { DAVCalendar } from 'tsdav'

export type DomEvent = GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap]

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

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

export type EventUid = {
  uid: string
  recurrenceId?: IcsRecurrenceId
}

export const attendeeRoleTypes = [
  'CHAIR',
  'REQ-PARTICIPANT',
  'OPT-PARTICIPANT',
  'NON-PARTICIPANT',
] as const
export type IcsAttendeeRoleType = typeof attendeeRoleTypes[number]

export const namedRRules = [
  'FREQ=DAILY',
  'FREQ=WEEKLY',
  'BYDAY=MO,TU,WE,TH,FR;FREQ=DAILY',
  'INTERVAL=2;FREQ=WEEKLY',
  'FREQ=MONTHLY',
  'FREQ=YEARLY',
] as const

export const availableViews = [
  'timeGridDay',
  'timeGridWeek',
  'dayGridMonth',
  'listDay',
  'listWeek',
  'listMonth',
  'listYear',
] as const
export type View = typeof availableViews[number]

export type ServerSource = {
  serverUrl: string
  headers?: Record<string, string>
  fetchOptions?: RequestInit
}

export type CalendarSource = {
  calendarUrl: string
  calendarUid?: unknown
  headers?: Record<string, string>
  fetchOptions?: RequestInit
}

export type SelectedCalendar = {
  url: string
  selected: boolean
}

export type SelectCalendarCallback = (calendar: SelectedCalendar) => void
export type SelectCalendarsClickInfo = {
  jsEvent: DomEvent
  calendars: Calendar[]
  selectedCalendars: Set<string>
  handleSelect: SelectCalendarCallback
}
export type SelectCalendarHandlers = {
  onClickSelectCalendars: (info: SelectCalendarsClickInfo) => void,
}

export type CalendarEvent = {
  calendarUrl: string
  event: IcsEvent
}
export type DisplayedCalendarEvent = {
  calendarUrl: string
  event: IcsEvent
  recurringEvent?: IcsEvent
}

export type EventBodyInfo = {
  calendar: Calendar
  event: IcsEvent
  view: View
}
export type BodyHandlers = {
  getEventBody: (info: EventBodyInfo) => Node[]
}

export type EventEditCallback = (event: CalendarEvent) => Promise<Response>
export type EventEditCreateInfo = {
  jsEvent: DomEvent
  userContact?: Contact,
  event: IcsEvent
  calendars: Calendar[]
  handleCreate: EventEditCallback
}
export type EventEditUpdateInfo = {
  jsEvent: DomEvent
  userContact?: Contact,
  calendarUrl: string
  event: IcsEvent
  recurringEvent?: IcsEvent
  calendars: Calendar[]
  handleUpdate: EventEditCallback
  handleDelete: EventEditCallback
}
export type EventEditDeleteInfo = {
  jsEvent: DomEvent
  userContact?: Contact,
  calendarUrl: string
  event: IcsEvent
  recurringEvent?: IcsEvent
  handleDelete: EventEditCallback
}
export type EventEditHandlers = {
  onCreateEvent: (info: EventEditCreateInfo) => void,
  onUpdateEvent: (info: EventEditUpdateInfo) => void,
  onDeleteEvent: (info: EventEditDeleteInfo) => void,
}

export type EventChangeInfo = {
  calendarUrl: string
  event: IcsEvent
  ical: string
}

export type EventChangeHandlers = {
  onEventCreated?: (info: EventChangeInfo) => void
  onEventUpdated?: (info: EventChangeInfo) => void
  onEventDeleted?: (info: EventChangeInfo) => void
}

export type CalendarElementOptions = {
  view?: View
  views?: View[]
  locale?: string
  date?: Date
  editable?: boolean
}

export type CalendarClientOptions = {
  userContact?: Contact
}

export type CalendarOptions =
  // NOTE - CJ - 2025-07-03
  // May define individual options or not
  CalendarElementOptions
  // May define individual options or not
  & CalendarClientOptions
  // Must define all handlers or none
  & (SelectCalendarHandlers | Record<never, never>)
  // Must define all handlers or none
  & (EventEditHandlers | Record<never, never>)
  // May define individual handlers or not
  & EventChangeHandlers
  // May define handlers or not, but they will be assigned a default value if they are not
  & Partial<BodyHandlers>

export type CalendarResponse = {
  response: Response
  ical: string
}


export type Contact = {
  name?: string
  email: string
}
