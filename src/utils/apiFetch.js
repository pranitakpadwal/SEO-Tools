// Shared fetch wrapper — attaches JWT, handles token refresh and 401 logout
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('session_token')
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })

  if (res.status === 401) {
    localStorage.removeItem('session_token')
    window.dispatchEvent(new CustomEvent('auth:logout'))
    return null
  }

  const data = await res.json()
  if (data?.token) localStorage.setItem('session_token', data.token)
  if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`)
  return data
}
