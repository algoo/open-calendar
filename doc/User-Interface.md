# User interface

Open calendar's interface is centered around [EventCalendar](https://github.com/vkurko/calendar).


## Components

As we want Open Calendar to be as customizable as possible, every component is independent and has its own designated folder.

A component is composed of a `ts` file and a `css` file.

Inside the ts file, the component is represent by a class of the same name and chunks of html as string. If it need to received arguments, the custom method `create` is used over the constructor as it can be made async.

The "management" of the DOM is done with [`Mustache`](https://github.com/janl/mustache.js) in `helpers/dom-helper.ts`.


## CalendarElement
This is the main component of Open Calendar and server as a bridge between custom components, EventCalendars and [CalendarClient](./Interfacing-with-CalDAV-and-CardDAV.md#2-extract-the-events-and-vcards).

The component will add event listeners to EventCalendars (e.g. `eventClick`), gather data from CalendarClient (e.g. `getCalendarEvent`) and call methods on custom components (e.g. `onUpdateEvent`).

It contains an instance of an EventCalendar, as well as of CalendarClient to get events and calendars. It also stores the callback, or `Handlers`, necessary to handle custom Components.
If no custom Components is specified, it will replace it with a predefined component (e.g `EventEditPopup`).


## Generic Components and css

The generic component `Popup` display as popup on the screen.

`index.css` contains generic css classes, mostly for forms