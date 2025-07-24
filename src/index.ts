import { CalendarElement } from './calendarelement/calendarElement'
import type { CalendarOptions, CalendarSource, RecursivePartial, ServerSource } from './types'
import './index.css'
import { setTranslations, type ResourceBundle } from './translations'
import '@fortawesome/fontawesome-free'

export async function createCalendar(
  sources: (ServerSource | CalendarSource)[],
  target: Element,
  options?: CalendarOptions,
  translations?: RecursivePartial<ResourceBundle>,
) {
  if (translations) setTranslations(translations)
  const calendar = new CalendarElement()
  await calendar.create(sources, target, options)
  return calendar
}
