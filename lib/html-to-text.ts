// lib/html-to-text.ts
import * as cheerio from "cheerio"

export type ParsedEmail = {
  plainText: string
  snippet: string
  links: Array<{
    href: string
    text?: string
    kind: "apply" | "unsubscribe" | "company" | "other"
  }>
  originalEmail: {
    gmailMessageId: string
    gmailUrl: string
  }
}

export function htmlToText(html: string): string {
  let s = html
  s = s.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
  s = s.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
  s = s.replace(/<\/p>/gi, "\n")
  s = s.replace(/<br\s*\/?>/gi, "\n")
  s = s.replace(/<\/div>/gi, "\n")
  s = s.replace(/<\/tr>/gi, "\n")
  s = s.replace(/<\/li>/gi, "\n")
  s = s.replace(/<hr\s*\/?>/gi, "\n")
  s = s.replace(/<[^>]+>/g, "") // Remove remaining tags
  s = s.replace(/&nbsp;/gi, " ")
  s = s.replace(/&amp;/gi, "&")
  s = s.replace(/&lt;/gi, "<")
  s = s.replace(/&gt;/gi, ">")
  s = s.replace(/&quot;/gi, '"')
  s = s.replace(/&#39;/g, "'")
  s = s.replace(/\s+/g, " ").replace(/\n\s+/g, "\n").trim()
  return s
}

function buildGmailUrl(messageId: string, mailbox: "inbox" | "all" = "all", userIndex = 0) {
  return `https://mail.google.com/mail/u/${userIndex}/#${mailbox}/${messageId}`
}

function classifyLink(href: string, text?: string): ParsedEmail["links"][number]["kind"] {
  const s = `${href} ${text ?? ""}`.toLowerCase()

  if (s.includes("unsubscribe")) return "unsubscribe"

  // common ATS providers + “apply” language
  if (
    s.includes("apply") ||
    s.includes("greenhouse.io") ||
    s.includes("lever.co") ||
    s.includes("workday") ||
    s.includes("icims.com") ||
    s.includes("myworkdayjobs") ||
    s.includes("smartrecruiters") ||
    s.includes("job")
  ) {
    return "apply"
  }

  if (s.includes("careers") || s.includes("about") || s.includes("company")) return "company"

  return "other"
}

function normalizeHref(href: string) {
  // Gmail emails often have html entities
  return href.replace(/&amp;/g, "&").trim()
}

export function parseEmailHtmlToObject(args: {
  html: string
  gmailMessageId: string
  gmailMailbox?: "inbox" | "all"
  gmailUserIndex?: number // 0 for most people
}): ParsedEmail {
  const { html, gmailMessageId, gmailMailbox = "all", gmailUserIndex = 0 } = args

  // 1) plain text for preview/search
  const plainText = htmlToText(html)
  const snippet = plainText.replace(/\s+/g, " ").slice(0, 220)

  // 2) extract links
  const $ = cheerio.load(html)
  const linksMap = new Map<string, { href: string; text?: string }>()

  $("a[href]").each((_, el) => {
    const rawHref = String($(el).attr("href") ?? "")
    const href = normalizeHref(rawHref)
    if (!href) return

    // skip non-web links
    if (href.startsWith("mailto:")) return
    if (href.startsWith("tel:")) return
    if (href.startsWith("#")) return
    if (href.startsWith("javascript:")) return

    // Optional: skip common tracking pixel-ish links
    // (keep this commented until you see it help)
    // if (href.includes("doubleclick") || href.includes("clickserve")) return

    if (!linksMap.has(href)) {
      const text = $(el).text().replace(/\s+/g, " ").trim()
      linksMap.set(href, { href, text: text || undefined })
    }
  })

  const links = Array.from(linksMap.values()).map((l) => ({
    ...l,
    kind: classifyLink(l.href, l.text),
  }))

  // promote apply/company/unsubscribe to the top for UI
  const score = (k: ParsedEmail["links"][number]["kind"]) =>
    k === "apply" ? 0 : k === "company" ? 1 : k === "unsubscribe" ? 2 : 3
  links.sort((a, b) => score(a.kind) - score(b.kind))

  return {
    plainText,
    snippet,
    links,
    originalEmail: {
      gmailMessageId,
      gmailUrl: buildGmailUrl(gmailMessageId, gmailMailbox, gmailUserIndex),
    },
  }
}
