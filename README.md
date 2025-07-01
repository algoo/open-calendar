> 🚧 This README is a work in progress 🚧

# Open Calendar

Open Calendar is a modern web calendar frontend for CalDAV based calendars.

**Insert Open Calendar image**


## Features

### Supports multiple calendars at the same time
It can deal with many CalDAV calendars at once, and also discover calendars directly from CalDAV servers.

### Functional out of the box
It supports all the features you would expect from a calendar client with little to no configuration: hide or show calendars or copy their URLs; drag, drop and resize events; show recurrent events, alarms, attendees and more.

### Easily customizable
Open Calendar is built to be customizable and integrated into larger apps.
Events content, forms, dropdowns and even notifications can be replaced by custom ones with ease

### Well documented
Documentation for the API as well as examples can be found **Insert documentation link**


## Quick start

First, install Open Calendar with the package manager of your choice (`yarn` in this case):
```bash
yarn add open-calendar
```

Once this is done, you can add Open Calendar to your application at different levels: 

### Minimal setup
With just a few lines of code, you can get a ready-to-use CalDAV client web application. All you need to do is call `createCalendar`:
```ts
// Insert minimal ts code
```
The full example is available **Insert demo module link**

### Customized forms
With a bit of development, you can integrate it into your web application by customizing the forms
```ts
// Insert form ts code
```
The full example is available **Insert demo module link**

### Complete integration
With a bit more work, you can even customize calendar all components like event rendering, etc
```ts
// Insert eventBody ts code
```
The full example is available **Insert demo module link**

## Architecture & development

Open Calendar is a TypeScript application relying on 3 main components:
- a Calendar rendering component: [EventCalendar](https://github.com/vkurko/calendar)
- a CalDAV client library: [tsdav](https://github.com/natelindev/tsdav)
- an ICS library: [ts-ics](https://github.com/Neuvernetzung/ts-ics)


## Need support, maintenance or features development?

Contact us at contact@algoo.fr
