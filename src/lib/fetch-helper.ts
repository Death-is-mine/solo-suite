// ponytail: one-line fetch wrapper, add retry/abort when needed
export async function apiGet<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} returned ${res.status}`)
  return res.json()
}

export async function apiPost<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`${url} returned ${res.status}`)
  return res.json()
}

export async function apiPut<T = unknown>(url: string, body: unknown): Promise<T> {
  const res = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  if (!res.ok) throw new Error(`${url} returned ${res.status}`)
  return res.json()
}
