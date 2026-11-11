/**
 * Central API client for Dog's Own Place
 * Automatically attaches the JWT token to every request.
 * Used by every page and component — no more localStorage data calls.
 */

const BASE = ''

// The session JWT lives in an httpOnly cookie set by the server, so JavaScript
// (and any XSS payload) can never read it. Only the non-sensitive user profile
// is cached in localStorage for the UI.
async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    credentials: 'same-origin',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  })
  let data = {}
  try { data = await res.json() } catch {}
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined') localStorage.removeItem('dop_user')
    throw new Error(data.error || 'Request failed')
  }
  return data
}

function saveUser(data) {
  if (data?.user) localStorage.setItem('dop_user', JSON.stringify(data.user))
}

// ── Auth ──────────────────────────────────────────────────────────────────

export async function apiRegister(body) {
  const data = await request('/api/auth/register', { method: 'POST', body: JSON.stringify(body) })
  saveUser(data)
  return data
}

export async function apiLogin(body) {
  const data = await request('/api/auth/login', { method: 'POST', body: JSON.stringify(body) })
  saveUser(data)
  return data
}

export async function apiLogout() {
  localStorage.removeItem('dop_user')
  localStorage.removeItem('dop_token') // legacy key from older versions
  try { await request('/api/auth/logout', { method: 'POST' }) } catch {}
}

export async function apiGetMe() {
  return request('/api/auth/me')
}

// ── Dogs ─────────────────────────────────────────────────────────────────

export async function apiGetDogs() {
  return request('/api/dogs')
}

export async function apiGetDog(id) {
  return request(`/api/dogs/${id}`)
}

export async function apiCreateDog(body) {
  return request('/api/dogs', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiUpdateDog(id, body) {
  return request(`/api/dogs/${id}`, { method: 'PATCH', body: JSON.stringify(body) })
}

export async function apiDeleteDog(id) {
  return request(`/api/dogs/${id}`, { method: 'DELETE' })
}

// ── Appointments ─────────────────────────────────────────────────────────

export async function apiGetAppointments() {
  return request('/api/appointments')
}

export async function apiCreateAppointment(body) {
  return request('/api/appointments', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiCancelAppointment(id, cancelReason = '') {
  return request(`/api/appointments/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'cancelled', cancelReason }),
  })
}

// ── Payments ─────────────────────────────────────────────────────────────

export async function apiGetPayments() {
  return request('/api/payments')
}

export async function apiCreatePayment(body) {
  return request('/api/payments', { method: 'POST', body: JSON.stringify(body) })
}

// ── Admin ────────────────────────────────────────────────────────────────

export async function apiAdminStats() {
  return request('/api/admin/stats')
}

export async function apiAdminUsers(search = '') {
  return request(`/api/admin/users${search ? `?search=${encodeURIComponent(search)}` : ''}`)
}

export async function apiAdminToggleUser(userId, isActive) {
  return request('/api/admin/users', { method: 'PATCH', body: JSON.stringify({ userId, isActive }) })
}

export async function apiAdminDeleteUser(userId) {
  return request('/api/admin/users', { method: 'DELETE', body: JSON.stringify({ userId }) })
}

export async function apiAdminBookings(status = 'all') {
  return request(`/api/admin/bookings?status=${encodeURIComponent(status)}`)
}

export async function apiAdminUpdateBooking(bookingId, status) {
  return request('/api/admin/bookings', { method: 'PATCH', body: JSON.stringify({ bookingId, status }) })
}

export async function apiAddHealthRecord(dogId, body) {
  return request(`/api/dogs/${dogId}/health`, { method: 'POST', body: JSON.stringify(body) })
}

// ── Contact (public) & admin inbox ───────────────────────────────────────
export async function apiSendContact(body) {
  return request('/api/contact', { method: 'POST', body: JSON.stringify(body) })
}

export async function apiAdminMessages() {
  return request('/api/admin/messages')
}

export async function apiAdminSetMessageStatus(id, status) {
  return request('/api/admin/messages', { method: 'PATCH', body: JSON.stringify({ id, status }) })
}

export async function apiAdminDeleteMessage(id) {
  return request('/api/admin/messages', { method: 'DELETE', body: JSON.stringify({ id }) })
}
