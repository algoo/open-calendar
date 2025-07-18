import { convertIcsRecurrenceRule, getEventEndFromDuration, type IcsAttendee, type IcsDateObject, type IcsEvent, type IcsOrganizer } from 'ts-ics'
import './eventEditPopup.css'
import { Popup } from '../popup/popup'
import { parseHtml } from '../helpers/dom-helper'
import { contactToMailbox, getRRuleString, isEventAllDay, isSameContact, mailboxToContact, offsetDate } from '../helpers/ics-helper'
import { tzlib_get_ical_block, tzlib_get_offset, tzlib_get_timezones } from 'timezones-ical-library'
import { getTranslations } from '../translations'
import { RecurringEventPopup } from './recurringEventPopup'
import { TIME_MINUTE } from '../constants'
import type { AddressBookVCard, Contact } from '../types/addressbook'
import type { DefaultComponentsOptions, DomEvent, EventEditCallback, EventEditCreateInfo, EventEditDeleteInfo, EventEditUpdateInfo } from '../types/options'
import type { Calendar } from '../types/calendar'
import { attendeeRoleTypes, namedRRules } from '../contants'
import type { VCard } from '../VCard'

const html = /*html*/`
<form name="event" class="open-calendar__event-edit open-calendar__form">
  <datalist id="open-calendar__event-edit__mailboxes">
  </datalist>
  <div class="open-calendar__form__content">
    <label for="open-calendar__event-edit__calendar">{{t.calendar}}</label>
    <select id="open-calendar__event-edit__calendar" name="calendar" required="">

    </select>
    <label for="open-calendar__event-edit__summary">{{t.title}}</label>
    <input type="text" id="open-calendar__event-edit__summary" name="summary" required="" />
    <label for="open-calendar__event-edit__location">{{t.location}}</label>
    <input type="text" id="open-calendar__event-edit__location" name="location" />
    <label for="open-calendar__event-edit__allday">{{t.allDay}}</label>
    <input type="checkbox" id="open-calendar__event-edit__allday" name="allday" />
    <label for="open-calendar__event-edit__start">{{t.start}}</label>
    <div id="open-calendar__event-edit__start" class="open-calendar__event-edit__datetime">
      <input type="date" name="start-date" required="" />
      <input type="time" name="start-time" required="" />
      <select name="start-timezone" required="">
        {{#timezones}}
          <option value="{{.}}">{{.}}</option>
        {{/timezones}}
        </select>
    </div>
    <label for="open-calendar__event-edit__end">{{t.end}}</label>
    <div id="open-calendar__event-edit__end" class="open-calendar__event-edit__datetime">
      <input type="date" name="end-date" required="" />
      <input type="time" name="end-time" required="" />
      <select name="end-timezone" required="">
        {{#timezones}}
          <option value="{{.}}">{{.}}</option>
        {{/timezones}}
      </select>
    </div>
    <label for="open-calendar__event-edit__organizer">{{t.organizer}}</label>
    <div id="open-calendar__event-edit__organizer" class="open-calendar__event-edit__attendee">
        <input type="text" name="organizer-mailbox" list="open-calendar__event-edit__mailboxes" />
    </div>
    <label for="open-calendar__event-edit__attendees">{{t.attendees}}</label>
    <div id="open-calendar__event-edit__attendees" class="open-calendar__event-edit__attendees" >
        <div class="open-calendar__form__list"> </div>
        <button type="button">{{t.addAttendee}}</button>
    </div>
    <label for="open-calendar__event-edit__rrule">{{t.rrule}}</label>
    <select id="open-calendar__event-edit__rrule" name="rrule">
      <option value="">{{trrules.none}}</option>
      {{#rrules}}
      <option value="{{rule}}">{{label}}</option>
      {{/rrules}}
      <option class="open-calendar__event-edit__rrule__unchanged" value="">{{trrules.unchanged}}</option>
    </select>
    <label for="open-calendar__event-edit__description">{{t.description}}</label>
    <textarea id="open-calendar__event-edit__description" name="description"> </textarea>
  </div>
  <div class="open-calendar__form__buttons">
    <button name="delete" type="button">{{t.delete}}</button>
    <button name="cancel" type="button">{{t.cancel}}</button>
    <button name="submit" type="submit">{{t.save}}</button>
  </div>
</form>`

const calendarsHtml = /*html*/`
<option value="" selected disabled hidden>{{t.chooseACalendar}}</option>
{{#calendars}}
  <option value="{{url}}">{{displayName}}</option>
{{/calendars}}`

const mailboxesHtml = /*html*/`
{{#mailboxes}}
  <option value="{{.}}">{{.}}</option>
{{/mailboxes}}`

const attendeeHtml = /*html*/`
<div class="open-calendar__event-edit__attendee">
  <input type="text" name="attendee-mailbox" value="{{mailbox}}" list="open-calendar__event-edit__mailboxes" />
  <select name="attendee-role" value="{{role}}" required>
    {{#roles}}
      <option value="{{key}}">{{translation}}</option>
    {{/roles}}
  </select>
  <button type="button" name="remove">X</button>
</div>`

export class EventEditPopup {

  private _recurringPopup: RecurringEventPopup
  private _popup: Popup
  private _form: HTMLFormElement
  private _calendar: HTMLSelectElement
  private _mailboxes: HTMLDataListElement
  private _attendees: HTMLDivElement
  private _rruleUnchanged: HTMLOptionElement

  private _hideVCardEmails?: boolean
  private _vCardContacts: VCard[] = []
  private _eventContacts: Contact[] = []

  private _event?: IcsEvent
  private _calendarUrl?: string
  private _handleSave: EventEditCallback | null = null
  private _handleDelete: EventEditCallback | null = null

  public constructor(target: Node, options: DefaultComponentsOptions) {
    this._hideVCardEmails = options.hideVCardEmails
    const timezones = tzlib_get_timezones() as string[]

    this._recurringPopup = new RecurringEventPopup(target)

    this._popup = new Popup(target)
    this._form = parseHtml<HTMLFormElement>(html, {
      t: getTranslations().eventForm,
      trrules: getTranslations().rrules,
      timezones: timezones,
      rrules: namedRRules.map(rule => ({ rule, label: getTranslations().rrules[rule]})),
    })[0]
    this._popup.content.appendChild(this._form)

    this._calendar = this._form.querySelector<HTMLSelectElement>('.open-calendar__form__content [name="calendar"]')!
    this._mailboxes = this._form.querySelector<HTMLSelectElement>('#open-calendar__event-edit__mailboxes')!
    this._attendees = this._form.querySelector<HTMLDivElement>(
      '.open-calendar__event-edit__attendees > .open-calendar__form__list',
    )!
    const allday = this._form.querySelector<HTMLButtonElement>('.open-calendar__event-edit [name="allday"]')!
    const addAttendee = this._form.querySelector<HTMLDivElement>('.open-calendar__event-edit__attendees > button')!
    this._rruleUnchanged = this._form.querySelector<HTMLOptionElement>('.open-calendar__event-edit__rrule__unchanged')!
    const cancel = this._form.querySelector<HTMLButtonElement>('.open-calendar__form__buttons [name="cancel"]')!
    const remove = this._form.querySelector<HTMLButtonElement>('.open-calendar__form__buttons [name="delete"]')!

    this._form.addEventListener('submit', async (e) => { e.preventDefault(); await this.save() })
    allday.addEventListener('click', this.updateAllday)
    addAttendee.addEventListener('click', () => this.addAttendee({ email: '' }))
    cancel.addEventListener('click', this.cancel)
    remove.addEventListener('click', this.delete)
  }

  public destroy = () => {
    this._form.remove()
  }

  private setCalendars = (calendars: Calendar[]) => {
    const calendarElements = parseHtml<HTMLOptionElement>(calendarsHtml, {
      calendars,
      t: getTranslations().eventForm,
    })
    this._calendar.innerHTML = ''
    this._calendar.append(...Array.from(calendarElements))
  }

  private setContacts = (vCardContacts: VCard[], eventContacts: Contact[]) => {
    this._vCardContacts = []
    for (const contact of vCardContacts) {
      if (this._vCardContacts.find(c => isSameContact(c, contact))) continue
      this._vCardContacts.push(contact)
    }
    for (const contact of eventContacts) {
      if (this._vCardContacts.find(c => isSameContact(c, contact))) continue
      if (this._eventContacts.find(c => isSameContact(c, contact))) continue
      this._eventContacts.push(contact)
    }
    const mailboxesElement = parseHtml<HTMLOptionElement>(mailboxesHtml, {
      mailboxes: [
        ...this._vCardContacts.map(c => this.getValueFromVCard(c)),
        ...this._eventContacts.map(c => this.getValueFromContact(c)),
      ],
    })
    this._mailboxes.innerHTML = ''
    this._mailboxes.append(...Array.from(mailboxesElement))
  }

  private updateAllday = (e: DomEvent) => {
    this._form.classList.toggle('open-calendar__event-edit--is-allday', (e.target as HTMLInputElement).checked)
  }

  private addAttendee = (attendee: IcsAttendee) => {
    const element = parseHtml<HTMLDivElement>(attendeeHtml, {
      mailbox: this.getValueFromAttendee(attendee),
      role: attendee.role || 'REQ-PARTICIPANT',
      roles: attendeeRoleTypes.map(role => ({ key: role, translation: getTranslations().attendeeRoles[role] })),
      t: getTranslations().eventForm,
    })[0]
    this._attendees.appendChild(element)

    const remove = element.querySelector<HTMLButtonElement>('button')!
    const role = element.querySelector<HTMLSelectElement>('select[name="attendee-role"]')!

    remove.addEventListener('click', () => element.remove())
    role.value = attendee.role || 'REQ-PARTICIPANT'
  }

  public onCreate = ({calendars, vCards, event, handleCreate}: EventEditCreateInfo) => {
    this._form.classList.toggle('open-calendar__event-edit--create', true)
    this._handleSave = handleCreate
    this._handleDelete = null
    this.open('', event, calendars, vCards)
  }
  public onUpdate = ({
    calendarUrl,
    calendars,
    vCards,
    event,
    recurringEvent,
    handleDelete,
    handleUpdate,
  }: EventEditUpdateInfo) => {
    this._form.classList.toggle('open-calendar__event-edit--create', false)
    this._handleSave = handleUpdate
    this._handleDelete = handleDelete
    if (!recurringEvent) this.open(calendarUrl, event, calendars, vCards)
    else this._recurringPopup.open(editAll => {
      return this.open(calendarUrl, editAll ? recurringEvent : event, calendars, vCards)
    })
  }
  public onDelete = ({calendarUrl, event, handleDelete}: EventEditDeleteInfo) => {
    handleDelete({calendarUrl, event})
  }

  public open = (calendarUrl: string, event: IcsEvent, calendars: Calendar[], vCards: AddressBookVCard[]) => {
    this.setContacts(
      vCards.filter(c => c.vCard.email !== null).map(c => c.vCard),
      [...event.attendees ?? [], event.organizer].filter(a => a !== undefined),
    )
    this.setCalendars(calendars)

    this._calendarUrl = calendarUrl
    this._event = event
    const localTzId = Intl.DateTimeFormat().resolvedOptions().timeZone
    const localTzOffset = new Date().getTimezoneOffset() * TIME_MINUTE
    const localStart = event.start.local ?? {
      date: new Date(event.start.date.getTime() - localTzOffset),
      timezone: localTzId,
    }
    const end = event.end ??
      offsetDate(
        localStart,
        getEventEndFromDuration(event.start.date, event.duration).getTime() - event.start.date.getTime(),
      )
    const localEnd = end.local ?? {
      date: new Date(end.date.getTime() - localTzOffset),
      timezone: localTzId,
    }

    const inputs = this._form.elements;
    (inputs.namedItem('calendar') as HTMLInputElement).value = calendarUrl;
    (inputs.namedItem('calendar') as HTMLInputElement).disabled = event.recurrenceId !== undefined;
    // FIXME - CJ - 2025/06/03 - changing an object of calendar is not supported;
    (inputs.namedItem('calendar') as HTMLInputElement).disabled ||=
      !this._form.classList.contains('open-calendar__event-edit--create');
    (inputs.namedItem('summary') as HTMLInputElement).value = event.summary ?? '';
    (inputs.namedItem('location') as HTMLInputElement).value = event.location ?? '';
    (inputs.namedItem('allday') as HTMLInputElement).checked = isEventAllDay(event)
    this._form.classList.toggle('open-calendar__event-edit--is-allday', isEventAllDay(event))
    const startDateTime = localStart.date.toISOString().split('T');
    (inputs.namedItem('start-date') as HTMLInputElement).value = startDateTime[0];
    (inputs.namedItem('start-time') as HTMLInputElement).value = startDateTime[1].slice(0, 5);
    (inputs.namedItem('start-timezone') as HTMLInputElement).value = localStart.timezone
    const endDateTime = localEnd.date.toISOString().split('T');
    (inputs.namedItem('end-date') as HTMLInputElement).value = endDateTime[0];
    (inputs.namedItem('end-time') as HTMLInputElement).value = endDateTime[1].slice(0, 5);
    (inputs.namedItem('end-timezone') as HTMLInputElement).value = localEnd.timezone;
    // TODO - CJ - 2025-07-03 - Add rich text support
    (inputs.namedItem('description') as HTMLInputElement).value = event.description ?? '';

    // TODO - CJ - 2025-07-03 - Check if needs to be hidden or done differently,
    // as I believe Thunderbird also adds the organizer to the attendee list;
    (inputs.namedItem('organizer-mailbox') as HTMLInputElement).value = event.organizer
      ? this.getValueFromAttendee(event.organizer)
      : ''

    const rrule =  getRRuleString(event.recurrenceRule)
    this._rruleUnchanged.value = rrule;
    (inputs.namedItem('rrule') as HTMLInputElement).value = rrule;
    (inputs.namedItem('rrule') as HTMLInputElement).disabled = event.recurrenceId !== undefined

    this._attendees.innerHTML = ''
    for (const attendee of event.attendees ?? []) this.addAttendee(attendee)

    this._popup.setVisible(true)
  }

  public save = async () => {
    const data = new FormData(this._form)
    const allDay = !!data.get('allday')

    const getTimeObject = (name: string): IcsDateObject => {
      const date = data.get(`${name}-date`) as string
      const time = data.get(`${name}-time`) as string
      const timezone = data.get(`${name}-timezone`) as string
      const offset = tzlib_get_offset(timezone, date, time)
      return {
        date: new Date(date + (allDay ? '' : `T${time}${offset}`)),
        type: allDay ? 'DATE' : 'DATE-TIME',
        local: timezone === 'UTC' ? undefined : {
          date: new Date(date + (allDay ? '' : `T${time}Z`)),
          timezone: tzlib_get_ical_block(timezone)[1].slice(5),
          tzoffset: offset,
        },
      }
    }

    const mailboxes = data.getAll('attendee-mailbox') as string[]
    const roles = data.getAll('attendee-role') as string[]
    const rrule = data.get('rrule') as string
    const description = data.get('description') as string

    const event: IcsEvent = {
      ...this._event!,
      summary: data.get('summary') as string,
      location: data.get('location') as string || undefined,
      start: getTimeObject('start'),
      end: getTimeObject('end'),
      description: description || undefined,
      descriptionAltRep: description === this._event!.description ? this._event!.descriptionAltRep : undefined,
      organizer: data.get('organizer-mailbox')
        ? {
          ...this._event!.organizer,
          ...this.getContactFromValue(data.get('organizer-mailbox') as string),
        }
        : undefined,
      attendees: mailboxes.map((mailbox, i) => ({
        ...this.getContactFromValue(mailbox),
        role: roles[i],
      })) || undefined,
      recurrenceRule: rrule ? convertIcsRecurrenceRule(undefined, {value: rrule}) : undefined,

      // NOTE - CJ - 2025-07-03 - explicitly set `duration` to undefined as we set `end`
      duration: undefined,
    }
    const response = await this._handleSave!({ calendarUrl: data.get('calendar') as string, event })
    if (response.ok) this._popup.setVisible(false)
  }

  public cancel = () => {
    this._popup.setVisible(false)
  }

  public delete = async () => {
    await this._handleDelete!({ calendarUrl: this._calendarUrl!, event: this._event!})
    this._popup.setVisible(false)
  }

  public getContactFromValue = (value: string) => {
    const contact = this._vCardContacts.find(c => this.getValueFromVCard(c) === value)
    return contact
      // NOTE - CJ - 2025-07-17 - we need to reconstruct an object as the spread syntax does not work for properties
      ? { name: contact.name!, email: contact.email!}
      : this._eventContacts.find(c => this.getValueFromContact(c) === value)
      ?? mailboxToContact(value)
  }

  public getValueFromAttendee = (attendee: IcsAttendee | IcsOrganizer): string => {
    const vCard = this._vCardContacts.find(c => isSameContact(c, attendee))
    return vCard ? this.getValueFromVCard(vCard) : this.getValueFromContact(attendee)
  }

  public getValueFromVCard = (contact: VCard) => (this._hideVCardEmails && contact.name) || contactToMailbox(contact)
  public getValueFromContact = (contact: Contact) => contactToMailbox(contact)
}
