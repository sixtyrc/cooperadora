const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Error ${res.status}`)
  }
  return res.json()
}

export const api = {
  getInstitution: () => request<import('../types').Institution>('/institution'),
  getCampaigns: () => request<import('../types').Campaign[]>('/campaigns'),
  getCampaign: (slug: string) => request<import('../types').Campaign>(`/campaigns/${slug}`),
  getCampaignProducts: (slug: string) => request<import('../types').Product[]>(`/campaigns/${slug}/products`),
  createOrder: (data: import('../types').OrderCreatePayload) =>
    request<import('../types').OrderCreateResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOrder: (code: string) => request<import('../types').Order>(`/orders/${code}`),
}
