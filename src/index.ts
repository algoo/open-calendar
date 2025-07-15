import { CalendarElement } from './calendarelement/calendarElement'
import './index.css'
import { setTranslations, type ResourceBundle} from './translations'
import type { AddressBookSource, CalendarOptions, CalendarSource, RecursivePartial, ServerSource } from './types/options'

export async function createCalendar(
  calendarSources: (ServerSource | CalendarSource)[],
  addressBookSources: (ServerSource | AddressBookSource)[],
  target: Element,
  options?: CalendarOptions,
  translations?: RecursivePartial<ResourceBundle>,
) {
  if (translations) setTranslations(translations)
  const calendar = new CalendarElement()
  await calendar.create(calendarSources, addressBookSources, target, options)
  return calendar
}
