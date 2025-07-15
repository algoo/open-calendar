import type { DAVAddressBook } from 'tsdav'

export type AddressBook = DAVAddressBook & {
  headers?: Record<string, string>
  uid?: unknown
}

export type VCard = {
  data: ParsedVCard
  etag?: string
  url: string
  addressBookUrl: string
}

export type AddressBookContact = {
  addressBookUrl: string
  contact: Contact
}


// TODO - CJ - replace with "real" types from a vcard parsing lib
export type ParsedVCard = {
  contacts: Contact[]
}

export type Contact = {
  email: string
  name?: string
}
