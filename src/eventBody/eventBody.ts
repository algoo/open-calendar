import { parseHtml } from '../helpers/dom-helper'
import type { EventBodyInfo, IcsAttendeeRoleType } from '../types'
import Autolinker from 'autolinker'
import { icon, library } from '@fortawesome/fontawesome-svg-core'
import { faRepeat, faBell } from '@fortawesome/free-solid-svg-icons'
import './eventBody.css'
import { isEventAllDay } from '../helpers/ics-helper'
import type { IcsAttendeePartStatusType } from 'ts-ics'
import { getTranslations } from '../translations'

library.add(faRepeat, faBell)

const html = /*html*/`
<div class="open-calendar-event-body">
  <div class="open-calendar-event-body-header">
    <div class="open-calendar-event-body-time">
      <b>{{time}}</b>
    </div>
    <div class="open-calendar-event-body-icons">
      {{#icons}}{{{.}}}{{/icons}}
    </div>
    {{summary}}
  </div>
  {{#location}}
  <div class="open-calendar-event-body-location">{{{location}}}</div>
  {{/location}}
  <div class="open-calendar-event-body-attendees">
    {{#organizer}}
    <span
        title="{{name}} <{{email}}>\n{{t.organizer}}"
        class="open-calendar-event-body-organizer">
      {{name}}
    </span>
    {{/organizer}}
    {{#attendees}}
    <span
        title="{{name}} <{{email}}>\n{{tRole}}\n{{tPartstat}}"
        class="
          open-calendar-event-body-attendee open-calendar-event-body-attendee-{{role}}
          open-calendar-event-body-attendee-{{partstat}}
        "
    >
      {{{name}}}
    </span>
    {{/attendees}}
  </div>
</div>`

export class EventBody {

  public getBody = ({ event }: EventBodyInfo) => {
    const time = event.start.date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    return Array.from(parseHtml(html, {
      time: isEventAllDay(event) ? undefined : time,
      summary: event.summary,
      icons: [
        event.recurrenceId ? icon({ prefix: 'fas', iconName: 'repeat' }).html.join('') : undefined,
        event.alarms ? icon({ prefix: 'fas', iconName: 'bell'}, {}).html.join('') : undefined,
      ],
      location: event.location ? Autolinker.link(event.location) : undefined,
      organizer: event.organizer ? {
        name: event.organizer.name ?? event.organizer.email,
        email: event.organizer.email,
      } : undefined,
      attendees: event.attendees ? event.attendees.map(a => ({
        name: a.name ?? a.email,
        email: a.email,
        role: ((a.role as IcsAttendeeRoleType) ?? 'NON-PARTICIPANT').toLowerCase(),
        tRole: getTranslations().attendeeRoles[(a.role as IcsAttendeeRoleType) ?? 'NON-PARTICIPANT'],
        tPartstat: getTranslations().partStatus[(a.partstat as IcsAttendeePartStatusType) ?? 'NEEDS-ACTION'],
        partstat: ((a.partstat as IcsAttendeePartStatusType) ?? 'NEEDS-ACTION').toLowerCase(),
      })) : undefined,
      t: getTranslations().eventBody,
    }))
  }
}
