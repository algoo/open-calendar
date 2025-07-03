import type { RecursivePartial } from './types'

// HACK - CJ - 2025-07-03 - Ideally, this object would have been a json file and imported with:
// `import en from 'locale/en/translation.json'`
// However, the lib used to create the declarations file `index.d.ts` thinks this is ts import
// and looks for the file `locale/en/translation.json.d.ts` which doesn't exists.
const en = {
  'calendarElement': {
    'timeGridDay': 'Day',
    'timeGridWeek': 'Week',
    'dayGridMonth': 'Month',
    'listDay': 'List',
    'listWeek': 'List Week',
    'listMonth': 'List Month',
    'listYear': 'List Year',
    'today': 'Today',
    'allDay': 'Daily',
    'calendars': 'Calendars',
    'newEvent': 'New Event',
  },
  'eventForm': {
    'allDay': 'Daily',
    'calendar': 'Calendar',
    'title': 'Title',
    'location': 'Location',
    'start': 'Start',
    'end': 'End',
    'organizer': 'Organizer',
    'attendees': 'Attendees',
    'addAttendee': 'Add attendee',
    'description': 'Description',
    'delete': 'Delete',
    'cancel': 'Cancel',
    'save': 'Save',
    'chooseACalendar': '-- Choose a calendar --',
    'email': 'email',
    'rrule': 'Frequency',
    'name': 'name',
  },
  'eventBody': {
    'organizer': 'Organizer',
  },
  'recurringForm': {
    'editRecurring': 'This is a recurring event',
    'editAll': 'Edit all occurrences',
    'editSingle': 'Edit this occurrence only',
  },
  'partStatus': {
    'NEEDS-ACTION': 'Needs to answer',
    'ACCEPTED': 'Accepted',
    'DECLINED': 'Declined',
    'TENTATIVE': 'Tentatively accepted',
    'DELEGATED': 'Delegated',
  },
  'attendeeRoles': {
    'CHAIR': 'Chair',
    'REQ-PARTICIPANT': 'Required participant',
    'OPT-PARTICIPANT': 'Optional participant',
    'NON-PARTICIPANT': 'Non participant',
  },
  'rrules': {
    'none': 'Never',
    'unchanged': 'Keep existing',
    'FREQ=DAILY': 'Daily',
    'FREQ=WEEKLY': 'Weekly',
    'BYDAY=MO,TU,WE,TH,FR;FREQ=DAILY': 'Workdays',
    'INTERVAL=2;FREQ=WEEKLY': 'Every two week',
    'FREQ=MONTHLY': 'Monthly',
    'FREQ=YEARLY': 'Yearly',
  },
}

export type ResourceBundle = typeof en

let translations = en

export const setTranslations = (bundle: RecursivePartial<ResourceBundle>) => translations = {
  calendarElement: {
    ...en.calendarElement,
    ...bundle.calendarElement,
  },
  eventForm: {
    ...en.eventForm,
    ...bundle.eventForm,
  },
  eventBody: {
    ...en.eventBody,
    ...bundle.eventBody,
  },
  recurringForm: {
    ...en.recurringForm,
    ...bundle.recurringForm,
  },
  partStatus: {
    ...en.partStatus,
    ...bundle.partStatus,
  },
  attendeeRoles: {
    ...en.attendeeRoles,
    ...bundle.attendeeRoles,
  },
  rrules: {
    ...en.rrules,
    ...bundle.rrules,
  },
}
export const getTranslations = () => translations
