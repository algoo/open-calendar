import { type IcsCalendar, type IcsEvent } from 'ts-ics'
import { createCalendarObject, deleteCalendarObject, fetchAddressBooks, fetchCalendarObjects, fetchCalendars, fetchVCards, updateCalendarObject } from './helpers/dav-helper'
import { isRRuleSourceEvent, isSameEvent, offsetDate } from './helpers/ics-helper'
import type { CalendarSource, ServerSource, AddressBookSource } from './types/options'
import type { Calendar, CalendarEvent, CalendarObject, DisplayedCalendarEvent, EventUid } from './types/calendar'
import type { AddressBook, AddressBookContact, VCard } from './types/addressbook'

export class CalendarClient {

  private _calendars: Calendar[] = []
  private _calendarObjectsPerCalendar: CalendarObject[][] = []
  private _recurringObjectsPerCalendar: CalendarObject[][] = []

  private _addressBooks: AddressBook[] = []
  private _vCardsPerAddressBook: VCard[][] = []

  public loadCalendars = async (sources: (ServerSource | CalendarSource)[]) => {
    const calendarsPerSource = await Promise.all(sources.map(source => fetchCalendars(source)))
    this._calendars = calendarsPerSource.flat()
    this._calendarObjectsPerCalendar = this._calendars.map(() => [])
  }

  public getCalendars = () => this._calendars

  public getCalendarByUrl = (url: string): Calendar | undefined => {
    return this._calendars.find(c => c.url === url)
  }

  public fetchAndLoadEvents = async (start: string, end: string): Promise<CalendarEvent[]> => {
    const allObjects = await Promise.all(
      this._calendars.map(calendar => fetchCalendarObjects(calendar, { start, end }, true)),
    )
    this._calendarObjectsPerCalendar = allObjects.map(objs => objs.calendarObjects)
    this._recurringObjectsPerCalendar = allObjects.map(objs => objs.recurringObjects)
    return this._calendarObjectsPerCalendar.flatMap(cos =>
      cos
        .flatMap(co => co.data.events ?? [])
        .map(event => ({ event, calendarUrl: cos[0].calendarUrl })))
  }

  public getCalendarEvent = (uid: EventUid): DisplayedCalendarEvent | undefined => {
    for (const calendarObject of this._calendarObjectsPerCalendar.flat()) {
      for (const event of calendarObject.data.events ?? []) {
        if (!isSameEvent(event, uid)) continue
        const recurringEvent = event.recurrenceId
          ? this.getCalendarObject(event)!.data.events!.find(e => isRRuleSourceEvent(event, e))
          : undefined
        return { calendarUrl: calendarObject.calendarUrl, event, recurringEvent }
      }
    }
    return undefined
  }

  public loadAddressBooks = async (sources: (ServerSource | AddressBookSource)[]) => {
    const addressBooksPerSources = await Promise.all(sources.map(source => fetchAddressBooks(source)))
    this._addressBooks = addressBooksPerSources.flat()
    this._vCardsPerAddressBook = this._addressBooks.map(() => [])
  }

  public fetchAndLoadContacts = async (): Promise<AddressBookContact[]> => {
    const vCards = await Promise.all(
      this._addressBooks.map(book => fetchVCards(book)),
    )
    this._vCardsPerAddressBook = vCards
    return this.getContacts()
  }

  public getContacts = (): AddressBookContact[] => this._vCardsPerAddressBook.flatMap(vCards =>
    vCards
      .flatMap(vCard => vCard.data.contacts ?? [])
      .map(contact => ({ contact, addressBookUrl: vCards[0].addressBookUrl })))

  private getCalendarObject = (uid: IcsEvent): CalendarObject | undefined => {
    for (const calendarObject of this._calendarObjectsPerCalendar.flat()) {
      for (const event of calendarObject.data.events ?? []) {
        // NOTE - CJ - 2025-07-03 - Since we look are just looking for the CalendarObject and not the event,
        // we just need to check the uid of any event, and not the recurrenceID
        if (event.uid !== uid.uid) continue
        if (event.recurrenceId) {
          for (const recurringObject of this._recurringObjectsPerCalendar.flat()) {
            for (const event of recurringObject.data.events ?? []) {
              if (event.uid === uid.uid) return recurringObject
            }
          }
          return undefined
        }
        return calendarObject
      }
    }
    return undefined
  }


  public createEvent = async ({ calendarUrl, event }: CalendarEvent) => {
    const calendar = this.getCalendarByUrl(calendarUrl)
    if (!calendar) return { response: new Response(null, { status: 404 }), ical: '' }
    const calendarObject: IcsCalendar = {
      // INFO - CJ - 2025-07-03 - prodId is a FPI (https://en.wikipedia.org/wiki/Formal_Public_Identifier)
      // '+//IDN algoo.fr//NONSGML Open Calendar v0.9//EN' would also be possible
      prodId: '-//algoo.fr//NONSGML Open Calendar v0.9//EN',
      version: '2.0',
      events: [event],
    }
    const response = await createCalendarObject(calendar, calendarObject)
    return response
  }

  // FIXME - CJ - 2025/06/03 - changing an object of calendar is not supported;
  public updateEvent = async ({ event }: CalendarEvent) => {
    const calendarObject = this.getCalendarObject(event)
    if (!calendarObject) return { response: new Response(null, { status: 404 }), ical: '' }
    const calendar = this.getCalendarByUrl(calendarObject.calendarUrl)!

    // FIXME - CJ - 2025-07-03 - Doing a deep copy probably be a better idea and avoid further issues
    const oldEvents = calendarObject.data.events ? [...calendarObject.data.events] : []

    const index = calendarObject.data.events!.findIndex(e => isSameEvent(e, event))

    // NOTE - CJ - 2025-07-03 - When an recurring event instance is modified for the 1st time,
    // it's not present in the `events` list and needs to be added
    if (event.recurrenceId && index === -1) {
      calendarObject.data.events!.push(event)
    } else {
      event.sequence = (event.sequence ?? 0) + 1
      calendarObject.data.events![index] = event
    }

    if (event.recurrenceRule) {
      // INFO - CJ - 2025-07-03 - `recurrenceId` of modified events needs to be synced with `start` of the root event
      calendarObject.data.events = calendarObject.data.events!.map(element => {
        if (element === event || !isRRuleSourceEvent(element, event)) return element
        const recurrenceOffset = element.recurrenceId!.value.date.getTime() - oldEvents[index].start.date.getTime()
        return {
          ...element,
          recurrenceId: { value: offsetDate(event.start, recurrenceOffset) },
        }
      })
      // INFO - CJ - 2025-07-03 - `exceptionDates` needs to be synced with `start`
      event.exceptionDates = event.exceptionDates?.map(value => {
        const recurrenceOffset = value.date.getTime() - oldEvents[index].start.date.getTime()
        return offsetDate(event.start, recurrenceOffset)
      })
    }
    const response = await updateCalendarObject(calendar, calendarObject)
    if (!response.response.ok) calendarObject.data.events = oldEvents
    return response
  }

  public deleteEvent = async ({ event }: CalendarEvent) => {
    const calendarObject = this.getCalendarObject(event)
    if (!calendarObject) return { response: new Response(null, { status: 404 }), ical: '' }
    const calendar = this.getCalendarByUrl(calendarObject.calendarUrl)!

    // FIXME - CJ - 2025-07-03 - Doing a deep copy probably be a better idea and avoid further issues
    const oldEvents = calendarObject.data.events ? [...calendarObject.data.events] : undefined

    // NOTE - CJ - 2025-07-03 - When removing a recurring event instance, add it to exceptionDates
    if (event.recurrenceId) {
      const rruleEvent = calendarObject.data.events!.find(e => isRRuleSourceEvent(event, e))!
      rruleEvent.exceptionDates ??= []
      rruleEvent.exceptionDates?.push(event.recurrenceId.value)
    }

    const index = calendarObject.data.events!.findIndex(e => isSameEvent(e, event))

    if (index !== -1) {
      event.sequence = (event.sequence ?? 0) + 1
      calendarObject.data.events!.splice(index, 1)
    }
    if (event.recurrenceRule) {
      calendarObject.data.events = calendarObject.data.events!.filter(e => !isRRuleSourceEvent(e, event))
    }

    const action = calendarObject.data.events!.length === 0 ? deleteCalendarObject : updateCalendarObject
    const response = await action(calendar, calendarObject)

    if (!response.response.ok) calendarObject.data.events = oldEvents
    return response
  }
}
