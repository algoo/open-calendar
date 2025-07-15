import { escapeHtml, parseHtml } from '../helpers/dom-helper'
import Autolinker from 'autolinker'
import { icon, library } from '@fortawesome/fontawesome-svg-core'
import { faRepeat, faBell } from '@fortawesome/free-solid-svg-icons'
import './eventBody.css'
import { contactToMailbox, isEventAllDay } from '../helpers/ics-helper'
import type { IcsAttendeePartStatusType } from 'ts-ics'
import { getTranslations } from '../translations'
import type { EventBodyInfo, IcsAttendeeRoleType } from '../types/options'

library.add(faRepeat, faBell)

const html = /*html*/`
<div class="open-calendar__event-body">
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
    <span
        title="{{mailbox}}\n{{t.organizer}}"
        class="open-calendar__event-body__organizer">
      {{name}}
    </span>
    {{/organizer}}
    {{#attendees}}
    <span
        title="{{mailbox}}\n{{tRole}}\n{{tPartstat}}"
        class="
          open-calendar__event-body__attendee open-calendar__event-body__attendee--{{role}}
          open-calendar__event-body__attendee--{{partstat}}
        "
    >
      {{name}}
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
      location: event.location ? Autolinker.link(escapeHtml(event.location)) : undefined,
      organizer: event.organizer ? {
        mailbox: contactToMailbox(event.organizer),
        name: event.organizer.name ?? event.organizer.email,
      } : undefined,
      attendees: event.attendees ? event.attendees.map(a => ({
        mailbox: contactToMailbox(a),
        name: a.name ?? a.email,
        role: ((a.role as IcsAttendeeRoleType) ?? 'NON-PARTICIPANT').toLowerCase(),
        tRole: getTranslations().attendeeRoles[(a.role as IcsAttendeeRoleType) ?? 'NON-PARTICIPANT'],
        tPartstat: getTranslations().partStatus[(a.partstat as IcsAttendeePartStatusType) ?? 'NEEDS-ACTION'],
        partstat: ((a.partstat as IcsAttendeePartStatusType) ?? 'NEEDS-ACTION').toLowerCase(),
      })) : undefined,
      t: getTranslations().eventBody,
    }))
  }
}
