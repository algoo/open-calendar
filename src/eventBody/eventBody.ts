import { escapeHtml, parseHtml } from '../helpers/dom-helper'
import type { EventBodyInfo, IcsAttendeeRoleType } from '../types'
import Autolinker from 'autolinker'
// import { icon as faIcon, library } from '@fortawesome/fontawesome-svg-core'
import './eventBody.css'
import { isEventAllDay } from '../helpers/ics-helper'
import type { IcsAttendeePartStatusType } from 'ts-ics'
import { getTranslations } from '../translations'


// library.add(faRepeat, faBell, faUserGraduate, faUser, faUserSlash, faCheck, faQuestion, faCross)

const html = /*html*/`
<div class="open-calendar__event-body">
  <i class="fa fa-regular fa-bell"></i>
  <div class="open-calendar__event-body__header">
    <div class="open-calendar__event-body__time">
      <b>{{time}}</b>
    </div>
    <div class="open-calendar__event-body__icons">
      {{#icons}}{{&.}}{{/icons}}
    </div>
    {{summary}}
  </div>
  {{#location}}
  <!-- NOTE - CJ - 2025-07-07 - location is escaped in the js as we wan to display a link -->
  <div class="open-calendar__event-body__location">{{&location}}</div>
  {{/location}}
  <div class="open-calendar__event-body__attendees">
    {{#organizer}}
    <div
      title="{{name}} <{{email}}>\n{{t.organizer}}"
      class="open-calendar__event-body__organizer"
    >
      {{&partIcon}}
      {{&roleIcon}}
      <span>{{name}}</span>
    </div>
    {{/organizer}}
    {{#attendees}}
    <div
      title="{{name}} <{{email}}>\n{{tRole}}\n{{tPartstat}}"
      class="
          open-calendar__event-body__attendee open-calendar__event-body__attendee--{{role}}
          open-calendar__event-body__attendee--{{partstat}}
        "
    
    >
      {{&partIcon}}
      {{&roleIcon}}
      <span>{{name}}</span>
    </div>
    {{/attendees}}
  </div>
</div>`

export class EventBody {

  public getBody = ({ event }: EventBodyInfo) => {
    // const faOptions = { classes: 'open-calendar__icon'}
    // const faOptionsWithColor = { classes: 'open-calendar__icon event-body-attendee-color'}
    const time = event.start.date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    return Array.from(parseHtml(html, {
      time: isEventAllDay(event) ? undefined : time,
      summary: event.summary,
      // icons: [
      //   event.recurrenceId ? faIcon({ prefix: 'fas', iconName: 'repeat' }).html.join('') : undefined,
      //   event.alarms ? faIcon({ prefix: 'fas', iconName: 'bell' }, {}).html.join('') : undefined,
      // ],
      location: event.location ? Autolinker.link(escapeHtml(event.location)) : undefined,
      organizer: event.organizer ? {
        // roleIcon: faIcon({ prefix: 'fas', iconName: 'user-graduate' }, faOptions).html.join(),
        // partIcon: faIcon({ prefix: 'fas', iconName: 'check' }, faOptionsWithColor).html.join(),
        name: event.organizer.name ?? event.organizer.email,
        email: event.organizer.email,
      } : undefined,

      attendees: event.attendees ? event.attendees.map(a => {
        const role = (a.role as IcsAttendeeRoleType) ?? 'NON-PARTICIPANT'
        // const roleIcon = role == 'CHAIR' ? faIcon({ prefix: 'fas', iconName: 'user-graduate' }, faOptions)
        //   : role == 'REQ-PARTICIPANT' ? faIcon({ prefix: 'fas', iconName: 'user' }, faOptions)
        //     : role == 'OPT-PARTICIPANT' ? faIcon({ prefix: 'far', iconName: 'user' }, faOptions)
        //       : faIcon({ prefix: 'fas', iconName: 'user-slash' }, faOptions)
        // const partIcon = a.partstat == 'ACCEPTED' ? faIcon({ prefix: 'fas', iconName: 'check' }, faOptionsWithColor)
        //   : a.partstat == 'NEEDS-ACTION' ? faIcon({ prefix: 'fas', iconName: 'question' }, faOptionsWithColor)
        //     : faIcon({ prefix: 'fas', iconName: 'cross' }, faOptionsWithColor)

        return {
          name: a.name ?? a.email,
          email: a.email,
          role: role.toLowerCase(),
          tRole: getTranslations().attendeeRoles[(a.role as IcsAttendeeRoleType) ?? 'NON-PARTICIPANT'],
          tPartstat: getTranslations().participationStatus[(a.partstat as IcsAttendeePartStatusType) ?? 'NEEDS-ACTION'],
          partstat: ((a.partstat as IcsAttendeePartStatusType) ?? 'NEEDS-ACTION').toLowerCase(),
          // roleIcon: roleIcon.html.join(),
          // partIcon: partIcon.html.join(),
        }
      }) : undefined,
      t: getTranslations().eventBody,
    }))
  }
}
