import { CalendarElement } from './calendarelement/calendarElement'
import type { CalendarOptions, CalendarSource, ServerSource } from './types'
import './index.css'
import { setTranslations, type ResourceBundle} from './translations'

export async function createCalendar(
  sources: (ServerSource | CalendarSource)[],
  target: Element | Document | ShadowRoot,
  options?: CalendarOptions,
  translations?: ResourceBundle,
) {
  if (translations) setTranslations(translations)
  const calendar = new CalendarElement()
  await calendar.create(sources, target, options)
  return calendar
}
