import { parseHtml } from '../helpers/dom-helper'
import './calendarSelectDropdown.css'
import type { SelectCalendarsClickInfo } from '../types/options'

const html = /* html */`
<div class="open-calendar__calendar-select__container open-calendar__form">
  <div class="open-calendar__form__content" >
    {{#calendars}}
    <label class="open-calendar__calendar-select__label" for="open-calendar__calendar-select__{{index}}">
      <span class="open-calendar__calendar-select__color" style="background-color:{{calendarColor}}"> </span>
      {{displayName}}
    </label>
    <input type="checkbox" id="open-calendar__calendar-select__{{index}}"/>
    {{/calendars}}
  </div>
</div>`

export class CalendarSelectDropdown {
  private _container: HTMLDivElement | null = null

  public constructor() {}
  public destroy = () => {}

  public onSelect = ({jsEvent, calendars, handleSelect, selectedCalendars }: SelectCalendarsClickInfo) => {
    const target = jsEvent.target as Element
    const parent = target.parentElement as Element

    if (this._container) {
      parent.removeChild(this._container)
      parent.classList.remove('open-calendar__calendar-select__parent')
      this._container = null
      return
    }
    this._container = parseHtml<HTMLDivElement>(html, {
      calendars: calendars.map((calendar, index) => ({ ...calendar, index })),
    })[0]
    parent.insertBefore(this._container, target)
    parent.classList.add('open-calendar__calendar-select__parent')

    const inputs = this._container.querySelectorAll<HTMLInputElement>('input')
    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i]
      const calendar = calendars[i]
      input.checked = selectedCalendars.has(calendar.url)
      input.addEventListener('change', e => handleSelect({
        url: calendar.url,
        selected: (e.target as HTMLInputElement).checked,
      }))
    }
  }
}
