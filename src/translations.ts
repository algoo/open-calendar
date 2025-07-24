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
    'userInvite': 'You were invited to this event',
    'addAlarm': 'Add an alarm',
    'alarms': 'Reminders',
  },
  'eventBody': {
    'organizer': 'Organizer',
  },
  'recurringForm': {
    'editRecurring': 'This is a recurring event',
    'editAll': 'Edit all occurrences',
    'editSingle': 'Edit this occurrence only',
  },
  'participationStatus': {
    'NEEDS-ACTION': 'Needs to answer',
    'ACCEPTED': 'Accepted',
    'DECLINED': 'Declined',
    'TENTATIVE': 'Tentatively accepted',
    'DELEGATED': 'Delegated',
  },
  'userParticipationStatus': {
    'NEEDS-ACTION': 'Not answered',
    'ACCEPTED': 'Accept',
    'DECLINED': 'Decline',
    'TENTATIVE': 'Accept tentatively',
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
  'triggers': {
    'unchanged': 'Keep current',
    'PT0S': 'When the event starts',
    '-PT5M': '5 minutes before',
    '-PT15M': '15 minutes before',
    '-PT30M': '30 minutes before',
    '-PT1H': '1 hour before',
    '-PT2H': '2 hours before',
    '-PT12H': '12 hours before',
    '-P1D': '1 day before',
    '-P2D': '2 days before',
    '-P1W': '1 week before',
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
  userParticipationStatus: {
    ...en.userParticipationStatus,
    ...bundle.userParticipationStatus,
  },
  participationStatus: {
    ...en.participationStatus,
    ...bundle.participationStatus,
  },
  attendeeRoles: {
    ...en.attendeeRoles,
    ...bundle.attendeeRoles,
  },
  triggers: {
    ...en.triggers,
    ...bundle.triggers,
  },
  rrules: {
    ...en.rrules,
    ...bundle.rrules,
  },
}
export const getTranslations = () => translations
