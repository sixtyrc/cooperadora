export function mediaUrl(value?: string | null): string {
  if (!value) return ''
  try {
    const url = new URL(value, window.location.origin)
    return url.pathname.startsWith('/media/')
      ? `${url.pathname}${url.search}`
      : url.toString()
  } catch {
    return value
  }
}
