import './popup.css'
import { parseHtml } from '../helpers/dom-helper'

const html = /*html*/`
<div class="open-calendar-popup-overlay open-calendar-popup-hidden">
  <div class="open-calendar-popup-frame"></div>
</div>`

export class Popup {

  private _node: HTMLDivElement
  public content: HTMLDivElement

  constructor(target: Node) {
    this._node = parseHtml<HTMLDivElement>(html)[0]
    target.appendChild(this._node)

    this.content = this._node.firstElementChild as HTMLDivElement

    window.addEventListener('mousedown', e => {
      if (this._node.classList.contains('open-calendar-popup-hidden')) return
      if (e.target instanceof Element && (e.target === this.content || e.target.contains(this.content))) {
        this.setVisible(false)
      }
    })
  }

  public destroy = () => {
    this._node.remove()
  }

  setVisible = (visible: boolean) => {
    this._node.classList.toggle('open-calendar-popup-hidden', !visible)
  }
}
