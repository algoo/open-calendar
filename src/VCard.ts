import ICAL from 'ical.js'

// TODO - CJ - 2025-07-16 - test with all versions (2,3,4) of vCards

export class VCard {

  public component: ICAL.Component

  public constructor(component: ICAL.Component) {
    if (component) this.component = component
    else this.component = new ICAL.Component('vcard')

  }

  get version() { return this._getProp('version') as string }
  set version(value: string) { this._setProp('version', value) }

  get uid() { return this._getProp('uid') as string }
  set uid(value: string) { this._setProp('uid', value) }

  get email() { return this._getProp('email') as (string | null) }
  set email(value: string | null) { this._setProp('email', value) }

  get name() { return this._getProp('fn') as string }
  set name(value: string) { this._setProp('fn', value) }

  private _setProp(name: string, value: unknown) {
    this.component.updatePropertyWithValue(name, value)
  }

  private _getProp(name: string): unknown {
    return this.component.getFirstPropertyValue(name)
  }
}
