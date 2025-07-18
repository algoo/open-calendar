import type { DAVAddressBook } from 'tsdav'
import ICAL from 'ical.js'
import type { VCard } from '../VCard'

export type AddressBook = DAVAddressBook & {
  headers?: Record<string, string>
  uid?: unknown
}

export type AddressBookObject = {
  data: ICAL.Component
  etag?: string
  url: string
  addressBookUrl: string
}

export type AddressBookVCard = {
  addressBookUrl: string
  vCard: VCard
}

export type Contact = {
  name?: string
  email: string
}
