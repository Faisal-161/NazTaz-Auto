/** Shared by the server layout (inline head script) and the client dismiss button. */
export const ANNOUNCEMENT_KEY = 'ui.announcement.dismissed'

/**
 * Inline <head> script: hides the bar before first paint if this announcement was dismissed,
 * so there is no flash or layout shift. CSS rule: html[data-hide-announcement] .announcement.
 */
export function announcementScript(id: string): string {
  return `try{if(localStorage.getItem(${JSON.stringify(ANNOUNCEMENT_KEY)})===${JSON.stringify(id)})document.documentElement.setAttribute('data-hide-announcement','')}catch(e){}`
}
