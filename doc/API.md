# Open Calendar's API

You can access Open Calendar by importing the function `createCalendar` from the module `open-dav-calendar`:
```ts
import { createCalendar } from 'open-dav-calendar'
```

### `createCalendar(calendarSources, addressBookSources, target, options?, translation?)`
- `calendarSources` (list of [ServerSource]() or [CalendarSource]()): The sources to fetch the calendars from
- `addressBookSources` (list of [ServerSource](), [AddressBookSource]() or [VCardProvider]()): The sources to fetch the contacts from
- `target` ([Element](https://developer.mozilla.org/docs/Web/API/Element)): An html element that will be the parent of the calendar
- `options` ([CalendarOptions](), optional): Options for available view, custom components, ...
- `translations` (Recursive partial of [ResourceBundle](), optional): Overrides of the translation values of Open Calendar
- return value ([CalendarElement](./Interface.md#calendarelement)): The calendar object

Creates a calendar under the node `target`
