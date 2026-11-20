export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

const SESSION_KEY = 'synchronized-study-desk.session-id'
const DEVICE_KEY = 'synchronized-study-desk.device-id'

export function getSessionId(): string {
  let id = sessionStorage.getItem(SESSION_KEY)
  if (!id) {
    id = randomId()
    sessionStorage.setItem(SESSION_KEY, id)
  }
  return id
}

export function startNewSession(): string {
  const id = randomId()
  sessionStorage.setItem(SESSION_KEY, id)
  return id
}

export function getDeviceId(): string {
  let id = sessionStorage.getItem(DEVICE_KEY)
  if (!id) {
    id = `laptop-${randomId().slice(0, 8)}`
    sessionStorage.setItem(DEVICE_KEY, id)
  }
  return id
}
