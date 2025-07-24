import type { CalendarOptions,
  SelectCalendarHandlers,
  EventEditHandlers,
  ServerSource,
  VCardProvider,
} from '../types/options'

export function isServerSource(source: ServerSource | unknown): source is ServerSource {
  return (source as ServerSource).serverUrl !== undefined
}

export function isVCardProvider(source: VCardProvider | unknown): source is VCardProvider {
  return (source as VCardProvider).fetchContacts !== undefined
}

export function hasEventHandlers(options: CalendarOptions): options is EventEditHandlers {
  return (options as EventEditHandlers).onCreateEvent !== undefined
}

export function hasCalendarHandlers(options: CalendarOptions): options is SelectCalendarHandlers {
  return (options as SelectCalendarHandlers).onClickSelectCalendars !== undefined
}
