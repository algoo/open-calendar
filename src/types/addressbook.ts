import type { DAVAddressBook } from 'tsdav'
import ICAL from 'ical.js'

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

export type VCard = {
  name: string
  email: string | null
}

export type AddressBookVCard = {
  // INFO - 2025-07-24 - addressBookUrl is undefined when the contact is from a VCardProvider
  addressBookUrl?: string
  vCard: VCard
}

export type Contact = {
  name?: string
  email: string
}
