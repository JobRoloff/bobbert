// lib/html-to-text.ts

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
  // console.log(s)
  return s
}
