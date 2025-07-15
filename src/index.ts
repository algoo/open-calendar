import { CalendarElement } from './calendarelement/calendarElement'
import './index.css'
import { setTranslations, type ResourceBundle} from './translations'
import type { CalendarOptions, CalendarSource, AddressBookFn, RecursivePartial, ServerSource } from './types/options'

export async function createCalendar(
  calDavSources: (ServerSource | CalendarSource)[],
  cardDavSources: (AddressBookFn)[],
  target: Element,
  options?: CalendarOptions,
  translations?: RecursivePartial<ResourceBundle>,
) {
  if (translations) setTranslations(translations)
  const calendar = new CalendarElement()
  await calendar.create(calDavSources, cardDavSources, target, options)
  return calendar
}
