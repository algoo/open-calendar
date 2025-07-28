# Interfacing with CalDAV calendars

CalDAV is a protocole used to exchange scheduling and event informations. It,s a extension to the WebDAV protocole.
The specs for CalDAV, iCalendar (the format of `.ics` files), and vcard (`.vcf`) are defined in [RFC 4791](http://www.webdav.org/specs/rfc4791.html), [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545.html#section-8.3), [RFC 6350](https://datatracker.ietf.org/doc/html/rfc6350) respectively.

This file does not describe the entire CalDAV or CardDAV details, only what used in Open Calendar

## The structure of Calendars and AddressBooks

They are a collection of dav objects, usually represented as of directory on disk. They have common set of properties, such as `D:displayname`, `tag` (`VCALENDAR` or `VADDRESSBOOK`). Calendars may defined additional properties such as `ICAL:calendar-color`.

DAV requests in XML can be made to request the content of these collections.

Each item of the collection is identified by its URL and an `etag` or `ctag` indicating the revision. The tag changes every time the object is updated.

> On its own, a dav object is not associated with a collection (calendar or address book), this link needs to be preserved by the caller.

## The structure of `.ics` and `.vcf` files.

ics and vcf files are written in raw text an consists of components.

A components starts with a `BEGIN:<compname>` tag and ends with a `END:<compname>` tag. Components can be nested.

### `VCALENDAR` component

This components is only present in ics files and contains multiple sub-components:
- `VTIMEZONE`: Represents a timezone (e.g. `Europe/Paris`). This will allow the use of this timezone in the other components
- `VEVENT`: Represents a single calendar event. Contains all the properties of the event (title, description, ...)

#### Recurring events

Events with an `RRULE` property or a `RDATE` property are recurring events, and they occur at specific occurrences.

In this case, the events can be represented in two different ways: 
1. If the occurrence has not been modified, by the 'template' `VEVENT` with the `RRULE` property.
2. Otherwise, by a different `VEVENT` component that must have the `RECURRENCE-ID` property, the original date of the occurrence

> All those components must be listed in the same ics file

> If the `DSTART` of the original event is modified, all `RECURRENCE-ID`s must be synched to this new date

#### Expanding recurrent events

As not all occurrences of a recurring event are saved (only the template one and the modified ones are), they need to be expanded to find all the occurrences to display.

This can be done by the client or by the server if the property `expand` is set in the request.

When this is done on the server, it will return a fake ics file containing all the occurrences inside a time range **WITHOUT** the template instance.

### `VCARD` component

This components is only present in vcf files and contains multiple various properties

## DAV in Open Calendar

As we've seen, this is not as simple task, and as such this not all done at once, but in two step.

1. Retrieve CalendarObjects / VCardObjects
2. Extract the events and vcards

The representation of those object evolve as they approach the interface:
- At the beginning of step 1.,we have `DAVObjects` with raw text content
- They are converted to `CalendarObject` or `VCardObject` with the raw content parsed just before step 2.
- From this we extract the `IcsEvent` and `VCardComponent`
- At the end of step 2., we have `CalendarEvent` and `AddressBookVCard` objects


## 1. Retrieve CalendarObjects / VCardObjects

> This is done in `helpers/dav-helper.ts` with [tsdav](https://github.com/natelindev/tsdav/) and [ts-ics](https://github.com/Neuvernetzung/ts-ics)

This file is used to handle requesting events, calendars, address books and vcard objects from the DAV sources.

tsdav executes the DAV queries and returns the ics and vcf files. ts-ics parses them into js objects.

> In `helpers/dav-helper.ts`, all the function starting with `dav`, from tsdav or defined in the file are the one doing the CalDAV requests. The others are a wrapper around them to parse `DAVObjects` to `CalendarObject`

## 2. Extract the events and vcards

> This is done in `calendarClient.ts`

At the end of step one, we have a list of objects containing events and vcards. The role of calendarClient is to store them and allow [CalendarElement](./User-Interface.md#calendarelement) to easily get the event and vcards inside those objects without having to think about WebDAV or storing the events, vcards, calendars itself.