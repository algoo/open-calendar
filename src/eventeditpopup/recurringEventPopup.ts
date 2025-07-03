import { Popup } from '../popup/popup'
import { parseHtml } from '../helpers/dom-helper'
import { getTranslations } from '../translations'

const html = /*html*/`
<div class="open-calendar-form">
  {{t.editRecurring}}
  <div class="open-calendar-form-buttons">
    <button name="edit-all" type="button">{{t.editAll}}</button>
    <button name="edit-single" type="button">{{t.editSingle}}</button>
  </div>
</div>
`

export class RecurringEventPopup {

  public _handleSelect?: (editAll: boolean) => void

  private _element: HTMLDivElement
  private _popup: Popup

  public constructor(target: Node) {
    this._popup = new Popup(target)
    this._element = parseHtml<HTMLDivElement>(html, { t: getTranslations().recurringForm })[0]
    this._popup.content.appendChild(this._element)

    const editAll = this._element.querySelector<HTMLButtonElement>('.open-calendar-form-buttons [name="edit-all"]')!
    const editSingle = this._element.querySelector<HTMLButtonElement>(
      '.open-calendar-form-buttons [name="edit-single"]',
    )!

    editAll.addEventListener('click', () => this.close(true))
    editSingle.addEventListener('click', () => this.close(false))
  }

  public destroy = () => {
    this._element.remove()
    this._popup.destroy()
  }

  public open = (handleSelect: (editAll: boolean) => void) => {
    this._handleSelect = handleSelect
    this._popup.setVisible(true)
  }
  private close = (editAll: boolean) => {
    this._popup.setVisible(false)
    this._handleSelect?.(editAll)
  }
}
