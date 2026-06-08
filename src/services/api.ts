
const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

function buildUrl(path: string) {
	if (/^https?:\/\//i.test(path)) return path

	const base = API_BASE_URL.replace(/\/+$/, '')
	const clean = path.replace(/^\/+/, '')
	return `${base}/${clean}`
}

async function handleResponse(res: Response) {
	const ct = res.headers.get('content-type') || ''
	if (ct.includes('application/json')) return res.json()
	return res.text()
}

export async function get(path: string) {
	const url = buildUrl(path)
	const res = await fetch(url, { credentials: 'include' })
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
	return handleResponse(res)
}

export async function post(path: string, data?: any) {
	const url = buildUrl(path)
	const res = await fetch(url, {
		method: 'POST',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: data === undefined ? undefined : JSON.stringify(data),
	})
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
	return handleResponse(res)
}

export async function postForm(path: string, form: FormData) {
	const url = buildUrl(path)
	const res = await fetch(url, {
		method: 'POST',
		credentials: 'include',
		body: form,
	})
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
	return handleResponse(res)
}

export async function put(path: string, data?: any) {
	const url = buildUrl(path)
	const res = await fetch(url, {
		method: 'PUT',
		credentials: 'include',
		headers: { 'Content-Type': 'application/json' },
		body: data === undefined ? undefined : JSON.stringify(data),
	})
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
	return handleResponse(res)
}

export async function del(path: string) {
	const url = buildUrl(path)
	const res = await fetch(url, { method: 'DELETE', credentials: 'include' })
	if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`)
	return handleResponse(res)
}

export default { get, post, postForm, put, del }

