export const attendeeRoleTypes = [
  'CHAIR',
  'REQ-PARTICIPANT',
  'OPT-PARTICIPANT',
  'NON-PARTICIPANT',
] as const

export const namedRRules = [
  'FREQ=DAILY',
  'FREQ=WEEKLY',
  'BYDAY=MO,TU,WE,TH,FR;FREQ=DAILY',
  'INTERVAL=2;FREQ=WEEKLY',
  'FREQ=MONTHLY',
  'FREQ=YEARLY',
] as const

export const availableViews = [
  'timeGridDay',
  'timeGridWeek',
  'dayGridMonth',
  'listDay',
  'listWeek',
  'listMonth',
  'listYear',
] as const
