import type { IcsEvent } from 'ts-ics'
import type { Calendar, CalendarEvent } from './calendar'
import type { Contact } from './addressbook'
import type { attendeeRoleTypes, availableViews } from '../contants'

export type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>
}

export type DomEvent = GlobalEventHandlersEventMap[keyof GlobalEventHandlersEventMap]

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

export type AddressBookFn = {
  fetchContacts: () => Promise<Contact[]>
}

export type View = typeof availableViews[number]
export type IcsAttendeeRoleType = typeof attendeeRoleTypes[number]


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
  event: IcsEvent
  calendars: Calendar[]
  contacts: Contact[]
  handleCreate: EventEditCallback
}
export type EventEditUpdateInfo = {
  jsEvent: DomEvent
  calendarUrl: string
  event: IcsEvent
  recurringEvent?: IcsEvent
  calendars: Calendar[]
  contacts: Contact[]
  handleUpdate: EventEditCallback
  handleDelete: EventEditCallback
}
export type EventEditDeleteInfo = {
  jsEvent: DomEvent
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
  // FIXME - CJ - 2025-07-30 - Do we keep this as this is for the entire CalendarOBject and not the event itself ?
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

export type CalendarOptions =
  // NOTE - CJ - 2025-07-03
  // May define individual options or not
  CalendarElementOptions
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
