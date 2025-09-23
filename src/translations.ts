import type { RecursivePartial } from './types/options'

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
    'rrule': 'Frequency',
    'userInvite': 'You were invited to this event',
  },
  'eventBody': {
    'organizer': 'Organizer',
    'participation_require': 'Required participant',
    'participation_optional': 'Optional participant',
    'non_participant': 'Non participant',
    'participation_confirmed': 'Participation confirmed',
    'participation_pending': 'Participation pending',
    'participation_confirmed_tentative': 'Participation confirmed tentative',
    'participation_declined': 'Participation declined',
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
  rrules: {
    ...en.rrules,
    ...bundle.rrules,
  },
}
export const getTranslations = () => translations
