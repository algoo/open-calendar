import { escapeHtml, parseHtml } from '../helpers/dom-helper'
import Autolinker from 'autolinker'
import { icon, library } from '@fortawesome/fontawesome-svg-core'
import { faRepeat, faBell, faChalkboardUser, faUserGraduate, faUser, faUserSlash, faCircleQuestion, faSquareCheck, faXmark, faLocationDot } from '@fortawesome/free-solid-svg-icons'
import { far } from '@fortawesome/free-regular-svg-icons'
import './eventBody.css'
import { contactToMailbox, isEventAllDay, isSameContact } from '../helpers/ics-helper'
import type { IcsAttendee, IcsAttendeePartStatusType, IcsOrganizer } from 'ts-ics'
import type { DefaultComponentsOptions, EventBodyInfo, IcsAttendeeRoleType } from '../types/options'
import type { AddressBookVCard } from '../types/addressbook'
import { getTranslations } from '../translations'

library.add(
  faRepeat,
  faBell,
  faChalkboardUser,
  faUserGraduate,
  faUser,
  faUserSlash,
  faCircleQuestion,
  faSquareCheck,
  faXmark,
  far,
  faLocationDot,
)

const addFaFw = (html: string) => html.replace('class="', 'class="fa-fw ')

const html = /*html*/`
<div class="open-calendar__event-body">
  <div class="open-calendar__event-body__header">
    <div class="open-calendar__event-body__time">
      <b>{{time}}</b>
    </div>
    <div class="open-calendar__event-body__icons">
      {{#icons}}{{&.}}{{/icons}}
    </div>
    <b>{{summary}}</b>
  </div>
  {{#location}}
  <!-- NOTE - CJ - 2025-07-07 - location is escaped in the js as we wan to display a link -->
  <div class="open-calendar__event-body__location">{{&location}}</div>
  {{/location}}
  <div class="open-calendar__event-body__attendees">
    {{#organizer}}
    <div class="open-calendar__event-body__attendee-line organizer">
      <span class="open-calendar__event-body__attendee-status-icon__confirmed" title="{{t.participation_confirmed}}">
        {{&organizerStatusIcon}}
      </span>
      <span class="open-calendar__event-body__attendee-role-icon" title="{{t.organizer}}">{{&organizerRoleIcon}}</span>
      <span class="open-calendar__event-body__attendee-name organizer">{{name}}</span>
    </div>
    {{/organizer}}
    {{#attendees}}
    <div class="open-calendar__event-body__attendee-line {{declinedClass}}">
      <span class="open-calendar__event-body__attendee-status-icon__{{statusClass}}" title="{{statusTitle}}">{{&statusIcon}}</span>
      <span class="open-calendar__event-body__attendee-role-icon" title="{{roleTitle}}">{{&roleIcon}}</span>
      <span class="open-calendar__event-body__attendee-name {{roleClass}}">{{name}}</span>
    </div>
    {{/attendees}}
  </div>
  {{#description}}
  <div class="open-calendar__event-body__description">{{&description}}</div>
  {{/description}}
</div>`

export class EventBody {

  private _hideVCardEmails?: boolean

  public constructor(options: DefaultComponentsOptions) {
    this._hideVCardEmails = options.hideVCardEmails
  }

  public getBody = ({ event, vCards, userContact }: EventBodyInfo) => {
    const time = event.start.date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    const attendees = event.attendees ? event.attendees.map(a => this.mapAttendee(a, vCards, userContact?.email)) : []
    const organizer = event.organizer ? {
      mailbox: this.getAttendeeValue(vCards, event.organizer),
      name: event.organizer.name ?? event.organizer.email,
      organizerStatusIcon: addFaFw(icon({ prefix: 'fas', iconName: 'square-check' }).html.join('')),
      organizerRoleIcon: addFaFw(icon({ prefix: 'fas', iconName: 'user-graduate' }).html.join('')),
    } : undefined

    const events = Array.from(parseHtml(html, {
      time: isEventAllDay(event) ? undefined : time,
      summary: event.summary,
      icons: [
        event.recurrenceId ? addFaFw(icon({ prefix: 'fas', iconName: 'repeat' }).html.join('')) : undefined,
        event.alarms ? addFaFw(icon({ prefix: 'fas', iconName: 'bell' }).html.join('')) : undefined,
      ],
      location: event.location
        ? [
            addFaFw(icon({ prefix: 'fas', iconName: 'location-dot' }).html.join('')),
            Autolinker.link(escapeHtml(event.location))
          ].join(' ')
        : undefined,
      description: event.description || undefined,
      attendees: attendees.map(att => ({
        ...att,
        statusIcon: att.isCurrentUser
          ? `<span
            class='open-calendar__event-body__status-clickable'
            data-email='${att.email}'
            title='${att.statusTitle}'
          >
            ${att.statusIcon}
          </span>`
          : att.statusIcon,
      })),
      organizer,
      t: getTranslations().eventBody,
    }))
    // Add click handler for current user status icon
    events.forEach(event => {
      if (!(event instanceof HTMLElement)) return
      event.querySelectorAll('.open-calendar__event-body__status-clickable').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          const email = (el as HTMLElement).getAttribute('data-email')
          event.dispatchEvent(new CustomEvent('participation-icon-click', {
            bubbles: true,
            detail: { email },
          }))
        })
      })
    })
    return events
  }

  public getAttendeeValue(vCards: AddressBookVCard[], attendee: IcsAttendee | IcsOrganizer) {
    const vCard = vCards.find(c => isSameContact(c.vCard, attendee))?.vCard
    return (this._hideVCardEmails && vCard?.name) || contactToMailbox(attendee)
  }

  public mapAttendee = (a: IcsAttendee, vCards: AddressBookVCard[], userEmail?: string) => {
    const role = ((a.role as IcsAttendeeRoleType) ?? 'NON-PARTICIPANT').toUpperCase()
    const partstat = ((a.partstat as IcsAttendeePartStatusType) ?? 'NEEDS-ACTION').toUpperCase()
    const t = getTranslations().eventBody
    let roleIcon = ''
    let roleTitle = ''
    let roleClass = ''
    if (role === 'CHAIR') {
      roleIcon = addFaFw(icon({ prefix: 'fas', iconName: 'user-graduate' }).html.join(''))
      roleTitle = t.organizer
      roleClass = 'organizer'
    } else if (role === 'REQ-PARTICIPANT') {
      roleIcon = addFaFw(icon({ prefix: 'fas', iconName: 'user' }).html.join(''))
      roleTitle = t.participation_require
      roleClass = 'required'
    } else if (role === 'OPT-PARTICIPANT') {
      roleIcon = addFaFw(icon({ prefix: 'far', iconName: 'user' }).html.join(''))
      roleTitle = t.participation_optional
      roleClass = 'optional'
    } else if (role === 'NON-PARTICIPANT') {
      roleIcon = addFaFw(icon({ prefix: 'fas', iconName: 'user-slash' }).html.join(''))
      roleTitle = t.non_participant
      roleClass = 'non-participant'
    }
    // Status icon, color, and title
    let statusIcon = ''
    let statusTitle = ''
    let statusClass = ''
    let declinedClass = ''
    const isCurrentUser = Boolean(userEmail && a.email && a.email === userEmail)
    if (partstat === 'NEEDS-ACTION') {
      statusIcon = addFaFw(icon({ prefix: 'fas', iconName: 'circle-question' }).html.join(''))
      statusClass = 'pending'
      statusTitle = t.participation_pending
    } else if (partstat === 'ACCEPTED') {
      statusIcon = addFaFw(icon({ prefix: 'fas', iconName: 'square-check' }).html.join(''))
      statusClass = 'confirmed'
      statusTitle = t.participation_confirmed
    } else if (partstat === 'TENTATIVE') {
      statusIcon = addFaFw(icon({ prefix: 'fas', iconName: 'square-check' }).html.join(''))
      statusClass = 'tentative'
      statusTitle = t.participation_confirmed_tentative
    } else if (partstat === 'DECLINED') {
      statusIcon = addFaFw(icon({ prefix: 'fas', iconName: 'xmark' }).html.join(''))
      statusClass = 'declined'
      statusTitle = t.participation_declined
      declinedClass = 'declined'
    }
    return {
      mailbox: this.getAttendeeValue(vCards, a),
      name: a.name ?? a.email,
      role,
      partstat,
      roleIcon,
      roleTitle,
      roleClass,
      statusIcon,
      statusClass,
      statusTitle,
      declinedClass,
      isCurrentUser,
      email: a.email,
    }
  }

}
