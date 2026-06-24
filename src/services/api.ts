export class ApiError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000'

function buildUrl(path: string) {
	//Vérifie si l'url est déja complète
	if (/^https?:\/\//i.test(path)) return path

	//Enlève les "/" en fin d'url
	const base = API_BASE_URL.replace(/\/+$/, '')
	//enoève les "/" en début pour les paths
	const clean = path.replace(/^\/+/, '')
	//Construit l'url final par base / clean
	return `${base}/${clean}`
}

async function handleResponse(res: Response) {
	const ct = res.headers.get('content-type') || ''
	if (!res.ok) {
		const body = ct.includes('application/json') ? await res.json().catch(() => ({})) : {}
		throw new ApiError(res.status, body.message ?? `HTTP ${res.status}`)
	}
	if (ct.includes('application/json')) return res.json()
	return res.text()
}

export async function get(path: string) {
	const url = buildUrl(path)
	//envoie les credentials
	const res = await fetch(url, { credentials: 'include' })
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
	return handleResponse(res)
}

export async function postForm(path: string, form: FormData) {
	const url = buildUrl(path)
	const res = await fetch(url, {
		method: 'POST',
		credentials: 'include',
		body: form,
	})
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
	return handleResponse(res)
}

export async function del(path: string) {
	const url = buildUrl(path)
	const res = await fetch(url, { method: 'DELETE', credentials: 'include' })
	return handleResponse(res)
}

export default { get, post, postForm, put, del }

