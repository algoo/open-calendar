import { generateIcsRecurrenceRule, type IcsDateObject, type IcsEvent, type IcsRecurrenceRule } from 'ts-ics'
import type { Contact, EventUid } from '../types'
import { parseOneAddress } from 'email-addresses'

export function isEventAllDay(event: IcsEvent) {
  return event.start.type === 'DATE' || event.end?.type === 'DATE'
}

export function offsetDate(date: IcsDateObject, offset: number): IcsDateObject {
  return {
    type: date.type,
    date: new Date(date.date.getTime() + offset),
    local: date.local && {
      date: new Date(date.local.date.getTime() + offset),
      timezone: date.local.timezone,
      tzoffset: date.local.tzoffset,
    },
  }
}

export function isSameEvent(a: EventUid, b: EventUid) {
  return a.uid === b.uid && a.recurrenceId?.value.date.getTime() === b.recurrenceId?.value.date.getTime()
}

export function isRRuleSourceEvent(eventInstance: EventUid, event: EventUid) {
  return eventInstance.uid === event.uid && event.recurrenceId === undefined
}

export function getRRuleString(recurrenceRule?: IcsRecurrenceRule) {
  if (!recurrenceRule) return ''
  return generateIcsRecurrenceRule(recurrenceRule).trim().slice(6)
}

// FIXME - CJ - 2025-07-11 - This function should only be used for display purposes
// It does not handle escape characters properly (quotes, comments)
// and parsing the result back to a contact with `mailboxToContact` may fail
// See https://datatracker.ietf.org/doc/html/rfc5322#section-3.4 the specs
export function contactToMailbox(contact: Contact) {
  return contact.name
    ? `${contact.name} <${contact.email}>`
    : contact.email
}

export function mailboxToContact(mailbox: string): Contact {
  const parsed = parseOneAddress(mailbox)
  if (parsed?.type !== 'mailbox') throw new Error(`Failed to parse mailbox '${mailbox}' `)
  return {
    name: parsed.name ?? undefined,
    email: parsed.address,
  }
}
