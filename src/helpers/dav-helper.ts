import { tzlib_get_ical_block } from 'timezones-ical-library'
import { convertIcsCalendar, convertIcsTimezone, generateIcsCalendar, type IcsCalendar } from 'ts-ics'
import { createAccount, fetchAddressBooks as davFetchAddressBooks, fetchCalendars as davFetchCalendars, fetchCalendarObjects as davFetchCalendarObjects, fetchVCards as davFetchVCards, createCalendarObject as davCreateCalendarObject, updateCalendarObject as davUpdateCalendarObject, deleteCalendarObject as davDeleteCalendarObject, DAVNamespaceShort, propfind, type DAVCalendar, type DAVCalendarObject, type DAVAddressBook } from 'tsdav'
import { isServerSource } from './types-helper'
import type { Calendar, CalendarObject } from '../types/calendar'
import type { CalendarSource, ServerSource, CalendarResponse, AddressBookSource } from '../types/options'
import type { AddressBook, AddressBookObject } from '../types/addressbook'
import ICAL from 'ical.js'

// HACK - CJ - 2025-07-09 - resolve the issue in Radicale of ts-ics directly (https://github.com/algoo/open-calendar/issues/1)
function fixAlldayRecurringDate(ics: string) {
  return ics.replace(/^(DTSTART|DTEND|RECURRENCE-ID):([0-9]{8})$/gm, '$1;VALUE=DATE:$2')
}

export async function fetchCalendars(source: ServerSource | CalendarSource): Promise<Calendar[]> {
  if (isServerSource(source)) {
    const account = await createAccount({
      account: { serverUrl: source.serverUrl, accountType: 'caldav' },
      headers: source.headers,
      fetchOptions: source.fetchOptions,
    })
    const calendars = await davFetchCalendars({ account, headers: source.headers, fetchOptions: source.fetchOptions })
    return calendars.map(calendar => ({ ...calendar, headers: source.headers, fetchOptions: source.fetchOptions }))
  } else {
    const calendar = await davFetchCalendar({
      url: source.calendarUrl,
      headers: source.headers,
      fetchOptions: source.fetchOptions,
    })
    return [{ ...calendar, headers: source.headers, fetchOptions: source.fetchOptions, uid: source.calendarUid }]
  }
}

export async function fetchCalendarObjects(
  calendar: Calendar,
  timeRange?: { start: string; end: string; },
  expand?: boolean,
): Promise<{ calendarObjects: CalendarObject[], recurringObjects: CalendarObject[] }> {
  const davCalendarObjects = await davFetchCalendarObjects({
    calendar: calendar,
    timeRange, expand,
    headers: calendar.headers,
    fetchOptions: calendar.fetchOptions,
  })
  const calendarObjects = davCalendarObjects.map(o => ({
    url: o.url,
    etag: o.etag,
    data: convertIcsCalendar(undefined, fixAlldayRecurringDate(o.data)),
    calendarUrl: calendar.url,
  }))
  const recurringObjectsUrls = new Set(
    calendarObjects
      .filter(c => c.data.events?.find(e => e.recurrenceId))
      .map(c => c.url),
  )
  const davDavRecurringObjects = recurringObjectsUrls.size == 0
    ? []
    : await davFetchCalendarObjects({
      calendar: calendar,
      objectUrls: Array.from(recurringObjectsUrls),
      headers: calendar.headers,
      fetchOptions: calendar.fetchOptions,
    })
  const recurringObjects = davDavRecurringObjects.map(o => ({
    url: o.url,
    etag: o.etag,
    data: convertIcsCalendar(undefined, o.data),
    calendarUrl: calendar.url,
  }))
  return { calendarObjects, recurringObjects }
}

export async function createCalendarObject(
  calendar: Calendar,
  calendarObjectData: IcsCalendar,
): Promise<CalendarResponse> {
  validateTimezones(calendarObjectData)
  for (const event of calendarObjectData.events ?? []) event.uid = crypto.randomUUID()
  const uid = calendarObjectData.events?.[0].uid ?? crypto.randomUUID()
  const iCalString = generateIcsCalendar(calendarObjectData)
  const response = await davCreateCalendarObject({
    calendar,
    iCalString,
    filename: `${uid}.ics`,
    headers: calendar.headers,
    fetchOptions: calendar.fetchOptions,
  })
  return { response, ical: iCalString }
}

export async function updateCalendarObject(
  calendar: Calendar,
  calendarObject: CalendarObject,
): Promise<CalendarResponse> {
  validateTimezones(calendarObject.data)
  const davCalendarObject: DAVCalendarObject = {
    url: calendarObject.url,
    etag: calendarObject.etag,
    data: generateIcsCalendar(calendarObject.data),
  }
  const response = await davUpdateCalendarObject({
    calendarObject: davCalendarObject,
    headers: calendar.headers,
    fetchOptions: calendar.fetchOptions,
  })
  return { response, ical: davCalendarObject.data }
}

export async function deleteCalendarObject(
  calendar: Calendar,
  calendarObject: CalendarObject,
): Promise<CalendarResponse> {
  validateTimezones(calendarObject.data)
  const davCalendarObject: DAVCalendarObject = {
    url: calendarObject.url,
    etag: calendarObject.etag,
    data: generateIcsCalendar(calendarObject.data),
  }
  const response = await davDeleteCalendarObject({
    calendarObject: davCalendarObject,
    headers: calendar.headers,
    fetchOptions: calendar.fetchOptions,
  })
  return { response, ical: davCalendarObject.data }

}

function validateTimezones(calendarObjectData: IcsCalendar) {
  const calendar = calendarObjectData
  const usedTimezones = calendar.events?.flatMap(e => [e.start.local?.timezone, e.end?.local?.timezone])
  const wantedTzIds = new Set(usedTimezones?.filter(s => s !== undefined))
  calendar.timezones ??= []

  // Remove extra timezones
  calendar.timezones = calendar.timezones.filter(tz => wantedTzIds.has(tz.id))

  // Add missing timezones
  wantedTzIds.forEach(tzid => {
    if (calendar.timezones!.findIndex(t => t.id === tzid) === -1) {
      calendar.timezones!.push(convertIcsTimezone(undefined, tzlib_get_ical_block(tzid)[0]))
    }
  })
}

// NOTE - CJ - 2025/07/03 - Inspired from https://github.com/natelindev/tsdav/blob/master/src/calendar.ts, fetchCalendars
async function davFetchCalendar(params: {
  url: string,
  headers?: Record<string, string>,
  fetchOptions?: RequestInit
}): Promise<DAVCalendar> {
  const { url, headers, fetchOptions } = params
  const response = await propfind({
    url,
    props: {
      [`${DAVNamespaceShort.CALDAV}:calendar-description`]: {},
      [`${DAVNamespaceShort.CALDAV}:calendar-timezone`]: {},
      [`${DAVNamespaceShort.DAV}:displayname`]: {},
      [`${DAVNamespaceShort.CALDAV_APPLE}:calendar-color`]: {},
      [`${DAVNamespaceShort.CALENDAR_SERVER}:getctag`]: {},
      [`${DAVNamespaceShort.DAV}:resourcetype`]: {},
      [`${DAVNamespaceShort.CALDAV}:supported-calendar-component-set`]: {},
      [`${DAVNamespaceShort.DAV}:sync-token`]: {},
    },
    headers,
    fetchOptions,
  })
  const rs = response[0]
  if (!rs.ok) {
    throw new Error(`Calendar ${url} does not exists. ${rs.status} ${rs.statusText}`)
  }
  if (Object.keys(rs.props?.resourceType ?? {}).includes('calendar')) {
    throw new Error(`${url} is not a ${rs.props?.resourceType} and not a calendar`)
  }
  const description = rs.props?.calendarDescription
  const timezone = rs.props?.calendarTimezone
  return {
    description: typeof description === 'string' ? description : '',
    timezone: typeof timezone === 'string' ? timezone : '',
    url: params.url,
    ctag: rs.props?.getctag,
    calendarColor: rs.props?.calendarColor,
    displayName: rs.props?.displayname._cdata ?? rs.props?.displayname,
    components: Array.isArray(rs.props?.supportedCalendarComponentSet.comp)
      // NOTE - CJ - 2025-07-03 - comp represents an list of XML nodes in the DAVResponse format
      // sc could be `<C:comp name="VEVENT" />`
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ? rs.props?.supportedCalendarComponentSet.comp.map((sc: any) => sc._attributes.name)
      : [rs.props?.supportedCalendarComponentSet.comp?._attributes.name],
    resourcetype: Object.keys(rs.props?.resourcetype),
    syncToken: rs.props?.syncToken,
  }
}

export async function fetchAddressBooks(source: ServerSource | AddressBookSource): Promise<AddressBook[]> {
  if (isServerSource(source)) {
    const account = await createAccount({
      account: { serverUrl: source.serverUrl, accountType: 'caldav' },
      headers: source.headers,
      fetchOptions: source.fetchOptions,
    })
    const books = await davFetchAddressBooks({ account, headers: source.headers, fetchOptions: source.fetchOptions })
    return books.map(book => ({ ...book, headers: source.headers, fetchOptions: source.fetchOptions }))
  } else {
    const book = await davFetchAddressBook({
      url: source.addressBookUrl,
      headers: source.headers,
      fetchOptions: source.fetchOptions,
    })
    return [{ ...book, headers: source.headers, fetchOptions: source.fetchOptions, uid: source.addressBookUid }]
  }
}


// NOTE - CJ - 2025/07/03 - Inspired from https://github.com/natelindev/tsdav/blob/master/src/addressBook.ts#L73
async function davFetchAddressBook(params: {
  url: string,
  headers?: Record<string, string>,
  fetchOptions?: RequestInit
}): Promise<DAVAddressBook> {
  const { url, headers, fetchOptions } = params
  const response = await propfind({
    url,
    props: {
      [`${DAVNamespaceShort.DAV}:displayname`]: {},
      [`${DAVNamespaceShort.CALENDAR_SERVER}:getctag`]: {},
      [`${DAVNamespaceShort.DAV}:resourcetype`]: {},
      [`${DAVNamespaceShort.DAV}:sync-token`]: {},
    },
    headers,
    fetchOptions,
  })
  const rs = response[0]
  if (!rs.ok) {
    throw new Error(`Address book ${url} does not exists. ${rs.status} ${rs.statusText}`)
  }
  if (Object.keys(rs.props?.resourceType ?? {}).includes('addressbook')) {
    throw new Error(`${url} is not a ${rs.props?.resourceType} and not an addressbook`)
  }
  const displayName = rs.props?.displayname?._cdata ?? rs.props?.displayname
  return {
    url: url,
    ctag: rs.props?.getctag,
    displayName: typeof displayName === 'string' ? displayName : '',
    resourcetype: Object.keys(rs.props?.resourcetype),
    syncToken: rs.props?.syncToken,
  }
}

export async function fetchAddressBookObjects(addressBook: AddressBook): Promise<AddressBookObject[]> {
  const davVCards = await davFetchVCards({
    addressBook: addressBook,
    headers: addressBook.headers,
    fetchOptions: addressBook.fetchOptions,
  })
  return davVCards.map(o => ({
    url: o.url,
    etag: o.etag,
    data: new ICAL.Component(ICAL.parse(o.data)),
    addressBookUrl: addressBook.url,
  }))
}
