import { escapeHtml, parseHtml } from '../helpers/dom-helper'
import Autolinker from 'autolinker'
import { icon, library } from '@fortawesome/fontawesome-svg-core'
import { faRepeat, faBell, faChalkboardUser, faUserGraduate, faUser, faUserSlash, faCircleQuestion, faSquareCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import './eventBody.css'
import { contactToMailbox, isEventAllDay, isSameContact } from '../helpers/ics-helper'
import type { IcsAttendee, IcsAttendeePartStatusType, IcsOrganizer } from 'ts-ics'
import type { DefaultComponentsOptions, EventBodyInfo, IcsAttendeeRoleType } from '../types/options'
import type { AddressBookVCard } from '../types/addressbook'

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
    {{summary}}
  </div>
  {{#location}}
  <!-- NOTE - CJ - 2025-07-07 - location is escaped in the js as we wan to display a link -->
  <div class="open-calendar__event-body__location">{{&location}}</div>
  {{/location}}
  <div class="open-calendar__event-body__attendees">
    {{#organizer}}
    <div class="open-calendar__event-body__attendee-line organizer">
      <span class="open-calendar__event-body__attendee-status-icon" title="Participation confirmée">
        {{&organizerStatusIcon}}
      </span>
      <span class="open-calendar__event-body__attendee-role-icon" title="Organisateur">{{&organizerRoleIcon}}</span>
      <span class="open-calendar__event-body__attendee-name organizer">{{name}}</span>
    </div>
    {{/organizer}}
    {{#attendees}}
    <div class="open-calendar__event-body__attendee-line {{declinedClass}}">
      <span class="open-calendar__event-body__attendee-status-icon" title="{{statusTitle}}">{{&statusIcon}}</span>
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
    const attendees = event.attendees ? event.attendees.map(a => {
      const role = ((a.role as IcsAttendeeRoleType) ?? 'NON-PARTICIPANT').toUpperCase()
      const partstat = ((a.partstat as IcsAttendeePartStatusType) ?? 'NEEDS-ACTION').toUpperCase()
      // Role icon and title
      let roleIcon = ''
      let roleTitle = ''
      let roleClass = ''
      if (role === 'CHAIR') {
        roleIcon = addFaFw(icon({ prefix: 'fas', iconName: 'user-graduate' }).html.join(''))
        roleTitle = 'Organisateur'
        roleClass = 'organizer'
      } else if (role === 'REQ-PARTICIPANT') {
        roleIcon = addFaFw(icon({ prefix: 'fas', iconName: 'user' }).html.join(''))
        roleTitle = 'Participation requise'
        roleClass = 'required'
      } else if (role === 'OPT-PARTICIPANT') {
        roleIcon = addFaFw(icon({ prefix: 'fas', iconName: 'user' }).html.join(''))
        roleTitle = 'Participation optionnelle'
        roleClass = 'optional'
      } else if (role === 'NON-PARTICIPANT') {
        roleIcon = addFaFw(icon({ prefix: 'fas', iconName: 'user-slash' }).html.join(''))
        roleTitle = 'Non participant'
        roleClass = 'non-participant'
      }
      // Status icon, color, and title
      let statusIcon = ''
      let statusTitle = ''
      let declinedClass = ''
      let isCurrentUser = false
      if (userContact && a.email && a.email === userContact.email) {
        isCurrentUser = true
      }
      if (partstat === 'NEEDS-ACTION') {
        statusIcon = addFaFw(icon({ prefix: 'fas', iconName: 'circle-question' }).html.join(''))
        statusTitle = 'En attente de réponse'
      } else if (partstat === 'ACCEPTED') {
        statusIcon = addFaFw(icon({ prefix: 'fas', iconName: 'square-check' }).html.join(''))
        statusTitle = 'Participation confirmée'
      } else if (partstat === 'TENTATIVE') {
        statusIcon = addFaFw(icon({ prefix: 'fas', iconName: 'square-check' }).html.join(''))
        statusTitle = 'Participation confirmée provisoirement'
      } else if (partstat === 'DECLINED') {
        statusIcon = addFaFw(icon({ prefix: 'fas', iconName: 'xmark' }).html.join(''))
        statusTitle = 'Participation refusée'
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
        statusTitle,
        declinedClass,
        isCurrentUser,
        email: a.email,
      }
    }) : []
    const organizer = event.organizer ? {
      mailbox: this.getAttendeeValue(vCards, event.organizer),
      name: event.organizer.name ?? event.organizer.email,
      organizerStatusIcon: addFaFw(icon({ prefix: 'fas', iconName: 'square-check' }).html.join('')),
      organizerRoleIcon: addFaFw(icon({ prefix: 'fas', iconName: 'user-graduate' }).html.join('')),
    } : undefined

    let isSmall = false
    if (event.start && event.end && event.start.date && event.end.date) {
      const duration = event.end.date.getTime() - event.start.date.getTime()
      isSmall = duration > 0 && duration <= 30 * 60 * 1000
    }

    const nodes = Array.from(parseHtml(html, {
      time: isEventAllDay(event) ? undefined : time,
      summary: event.summary,
      icons: [
        event.recurrenceId ? addFaFw(icon({ prefix: 'fas', iconName: 'repeat' }).html.join('')) : undefined,
        event.alarms ? addFaFw(icon({ prefix: 'fas', iconName: 'bell' }).html.join('')) : undefined,
      ],
      location: event.location ? Autolinker.link(escapeHtml(event.location)) : undefined,
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
    }))
    // Add click handler for current user status icon
    nodes.forEach(node => {
      if (!(node instanceof HTMLElement)) return
      node.querySelectorAll('.open-calendar__event-body__status-clickable').forEach(el => {
        el.addEventListener('click', (e) => {
          e.stopPropagation()
          const email = (el as HTMLElement).getAttribute('data-email')
          node.dispatchEvent(new CustomEvent('participation-icon-click', {
            bubbles: true,
            detail: { email },
          }))
        })
      })
      // Mark small if short duration or visually truncated; overlay expansion handled by calendarElement
      setTimeout(() => {
        const content = node as HTMLElement
        const isTruncated = content.scrollHeight > content.clientHeight
        if (isSmall || isTruncated) content.classList.add('open-calendar__event-body--small')
      }, 0)
    })
    return nodes
  }

  public getAttendeeValue(vCards: AddressBookVCard[], attendee: IcsAttendee | IcsOrganizer) {
    const vCard = vCards.find(c => isSameContact(c.vCard, attendee))?.vCard
    return (this._hideVCardEmails && vCard?.name) || contactToMailbox(attendee)
  }
}
