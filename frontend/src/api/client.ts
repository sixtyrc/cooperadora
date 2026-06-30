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
  updateInstitution: (data: Partial<import('../types').Institution>) =>
    request<import('../types').Institution>('/institution', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  getCampaigns: () => request<import('../types').Campaign[]>('/campaigns'),
  getCampaign: (slug: string) => request<import('../types').Campaign>(`/campaigns/${slug}`),
  getCampaignProducts: (slug: string) => request<import('../types').Product[]>(`/campaigns/${slug}/products`),
  createOrder: (data: import('../types').OrderCreatePayload) =>
    request<import('../types').OrderCreateResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOrder: (code: string) => request<import('../types').Order>(`/orders/${code}`),

  login: (username: string, password: string) =>
    request<{ detail: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ detail: string }>('/auth/logout', { method: 'POST' }),
  getMe: () => request<{ id: number; username: string; role: string; is_admin: boolean }>('/auth/me'),

  getAdminCampaigns: () => request<import('../types').Campaign[]>('/admin/campaigns'),
  createCampaign: (data: Partial<import('../types').Campaign>) =>
    request<import('../types').Campaign>('/admin/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCampaign: (id: number, data: Partial<import('../types').Campaign>) =>
    request<import('../types').Campaign>(`/admin/campaigns/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteCampaign: (id: number) =>
    request<void>(`/admin/campaigns/${id}`, { method: 'DELETE' }),

  getAdminProducts: (campaignId?: number) => {
    const params = campaignId ? `?campaign=${campaignId}` : ''
    return request<import('../types').Product[]>(`/admin/products${params}`)
  },
  createProduct: (data: Partial<import('../types').Product>) =>
    request<import('../types').Product>('/admin/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateProduct: (id: number, data: Partial<import('../types').Product>) =>
    request<import('../types').Product>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteProduct: (id: number) =>
    request<void>(`/admin/products/${id}`, { method: 'DELETE' }),

  getAdminOrders: (status?: string) => {
    const params = status ? `?status=${status}` : ''
    return request<import('../types').AdminOrder[]>(`/admin/orders${params}`)
  },
  getAdminOrder: (id: number) => request<import('../types').AdminOrder>(`/admin/orders/${id}`),
  updateOrder: (id: number, data: Partial<import('../types').AdminOrder>) =>
    request<import('../types').AdminOrder>(`/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getAdminPayments: (status?: string) => {
    const params = status ? `?status=${status}` : ''
    return request<import('../types').Payment[]>(`/admin/payments${params}`)
  },
  getAdminPayment: (id: number) => request<import('../types').Payment>(`/admin/payments/${id}`),
  updatePayment: (id: number, data: Partial<import('../types').Payment>) =>
    request<import('../types').Payment>(`/admin/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getAdminDeliveries: () => request<import('../types').Delivery[]>('/admin/deliveries'),
  createDelivery: (data: Partial<import('../types').Delivery>) =>
    request<import('../types').Delivery>('/admin/deliveries', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAdminDelivery: (id: number) => request<import('../types').Delivery>(`/admin/deliveries/${id}`),
  updateDelivery: (id: number, data: Partial<import('../types').Delivery>) =>
    request<import('../types').Delivery>(`/admin/deliveries/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUsers: () => request<import('../types').User[]>('/admin/users'),
  createUser: (data: { username: string; password: string; first_name: string; last_name: string; email: string; role: string }) =>
    request<import('../types').User>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateUser: (id: number, data: Partial<import('../types').User & { password?: string }>) =>
    request<import('../types').User>(`/admin/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  deleteUser: (id: number) =>
    request<void>(`/admin/users/${id}`, { method: 'DELETE' }),

  getAuditLogs: () => request<import('../types').AuditLog[]>('/admin/audit'),

  getDashboard: () => request<import('../types').DashboardData>('/reports/dashboard'),
  getReportsCampaigns: () => request<import('../types').CampaignReport[]>('/reports/campaigns'),
  getReportsProducts: () => request<import('../types').ProductReport[]>('/reports/products'),
  getReportsClassrooms: () => request<import('../types').ClassroomReport[]>('/reports/classrooms'),
  exportExcel: () => fetch(`${BASE}/reports/export/excel`).then(r => r.blob()),
  exportPdf: () => fetch(`${BASE}/reports/export/pdf`).then(r => r.blob()),
}
