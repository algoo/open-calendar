import Mustache from 'mustache'

export function parseHtml<N extends ChildNode = ChildNode>(html: string, format?: unknown): NodeListOf<N> {
  html = Mustache.render(html, format)
  return Document.parseHTMLUnsafe(html).body.childNodes as NodeListOf<N>
}

export function escapeHtml(html: string): string {
  // NOTE - CJ - 2025-07-07 - In Mustache, {{html}} escapes html whereas {{{html}}} and {{&html}} do not
  return Mustache.render('{{html}}', { html })
}
