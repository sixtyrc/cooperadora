const BASE = '/api'

async function fetchCsrfToken(): Promise<string> {
  await fetch(`${BASE}/auth/csrf`, { credentials: 'include' })
  await new Promise(r => setTimeout(r, 50))
  const match = document.cookie.match(/csrftoken=([^;]+)/)
  return match ? match[1] : ''
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const method = options?.method?.toUpperCase() || 'GET'
  const needsCsrf = method !== 'GET' && method !== 'HEAD'

  const headers: Record<string, string> = {}
  if (options?.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }
  if (needsCsrf) {
    headers['X-CSRFToken'] = await fetchCsrfToken()
  }

  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: { ...headers, ...options?.headers },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.detail || `Error ${res.status}`)
  }
  return res.json()
}

export const api = {
  getInstitution: () => request<import('../types').Institution>('/institution'),
  updateInstitution: (data: FormData) =>
    request<import('../types').Institution>('/institution', {
      method: 'PATCH',
      body: data,
    }),
  getCampaigns: () => request<import('../types').Campaign[]>('/campaigns'),
  getCampaign: (slug: string) => request<import('../types').Campaign>(`/campaigns/${slug}`),
  getCampaignProducts: (slug: string) => request<import('../types').Product[]>(`/campaigns/${slug}/products`),
  createOrder: (data: import('../types').OrderCreatePayload) =>
    request<import('../types').OrderCreateResponse>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getOrder: (code: string, phone: string) =>
    request<import('../types').Order>(`/orders/${encodeURIComponent(code)}?phone=${encodeURIComponent(phone)}`),

  getOrderPdfUrl: (code: string, phone: string) =>
    `${BASE}/orders/${encodeURIComponent(code)}/pdf?phone=${encodeURIComponent(phone)}`,

  getPaymentPdfUrl: (id: number) => `${BASE}/payments/${id}/pdf`,

  ocrVoucher: async (file: File) => {
    const token = await fetchCsrfToken()
    const fd = new FormData()
    fd.append('voucher', file)
    return fetch(`${BASE}/payments/ocr`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken': token },
      body: fd,
    }).then(async r => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        throw new Error(body.detail || `Error ${r.status}`)
      }
      return r.json()
    })
  },

  createPayment: async (data: { order: number; phone: string; method: string; voucher?: File; ocr?: Record<string, string | number | null> }) => {
    const token = await fetchCsrfToken()
    const fd = new FormData()
    fd.append('order', String(data.order))
    fd.append('phone', data.phone)
    fd.append('method', data.method)
    if (data.voucher) fd.append('voucher', data.voucher)
    if (data.ocr) {
      if (data.ocr.name) fd.append('ocr_name', String(data.ocr.name))
      if (data.ocr.dni) fd.append('ocr_dni', String(data.ocr.dni))
      if (data.ocr.amount) fd.append('ocr_amount', String(data.ocr.amount))
      if (data.ocr.date) fd.append('ocr_date', String(data.ocr.date))
      if (data.ocr.operation_id) fd.append('ocr_operation_id', String(data.ocr.operation_id))
    }
    return fetch(`${BASE}/payments`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'X-CSRFToken': token },
      body: fd,
    }).then(async r => {
      if (!r.ok) {
        const body = await r.json().catch(() => ({}))
        throw new Error(body.detail || `Error ${r.status}`)
      }
      return r.json()
    })
  },

  getCsrf: fetchCsrfToken,
  login: (username: string, password: string) =>
    request<{ detail: string; role: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  logout: () => request<{ detail: string }>('/auth/logout', { method: 'POST' }),
  getMe: () => request<{ id: number; username: string; role: string; is_admin: boolean }>('/auth/me'),

  getAdminCampaigns: () => request<import('../types').Campaign[]>('/admin/campaigns'),
  createCampaign: (data: FormData) =>
    request<import('../types').Campaign>('/admin/campaigns', {
      method: 'POST',
      body: data,
    }),
  updateCampaign: (id: number, data: FormData) =>
    request<import('../types').Campaign>(`/admin/campaigns/${id}`, {
      method: 'PATCH',
      body: data,
    }),
  deleteCampaign: (id: number) =>
    request<void>(`/admin/campaigns/${id}`, { method: 'DELETE' }),

  getAdminProducts: (campaignId?: number) => {
    const params = campaignId ? `?campaign=${campaignId}` : ''
    return request<import('../types').Product[]>(`/admin/products${params}`)
  },
  createProduct: (data: FormData) =>
    request<import('../types').Product>('/admin/products', {
      method: 'POST',
      body: data,
    }),
  updateProduct: (id: number, data: FormData) =>
    request<import('../types').Product>(`/admin/products/${id}`, {
      method: 'PATCH',
      body: data,
    }),
  deleteProduct: (id: number) =>
    request<void>(`/admin/products/${id}`, { method: 'DELETE' }),

  getAdminOrders: (filters?: { status?: string; campaign?: string; date_from?: string; date_to?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.set('status', filters.status)
    if (filters?.campaign) params.set('campaign', filters.campaign)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    const qs = params.toString()
    return request<import('../types').AdminOrder[]>(`/admin/orders${qs ? '?' + qs : ''}`)
  },
  getAdminOrder: (id: number) => request<import('../types').AdminOrder>(`/admin/orders/${id}`),
  updateOrder: (id: number, data: Partial<import('../types').AdminOrder>) =>
    request<import('../types').AdminOrder>(`/admin/orders/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getAdminPayments: (filters?: { status?: string; reconciliation?: string; campaign?: string; date_from?: string; date_to?: string }) => {
    const params = new URLSearchParams()
    if (filters?.status) params.set('status', filters.status)
    if (filters?.reconciliation) params.set('reconciliation', filters.reconciliation)
    if (filters?.campaign) params.set('campaign', filters.campaign)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    const qs = params.toString()
    return request<import('../types').Payment[]>(`/admin/payments${qs ? '?' + qs : ''}`)
  },
  getAdminPayment: (id: number) => request<import('../types').Payment>(`/admin/payments/${id}`),
  updatePayment: (id: number, data: Partial<import('../types').Payment>) =>
    request<import('../types').Payment>(`/admin/payments/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getAdminDeliveries: (filters?: { campaign?: string; date_from?: string; date_to?: string }) => {
    const params = new URLSearchParams()
    if (filters?.campaign) params.set('campaign', filters.campaign)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    const qs = params.toString()
    return request<import('../types').Delivery[]>(`/admin/deliveries${qs ? '?' + qs : ''}`)
  },
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

  getDeliveryCheck: (campaign?: string) => {
    const params = campaign ? `?campaign=${campaign}` : ''
    return request<import('../types').DeliveryCheck[]>(`/admin/orders/delivery-check${params}`)
  },
  toggleDelivery: (orderId: number) =>
    request<{ delivered: boolean }>('/admin/orders/delivery-check', {
      method: 'PATCH',
      body: JSON.stringify({ order_id: orderId }),
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

  getAuditLogs: (filters?: { date_from?: string; date_to?: string; user?: string; action?: string }) => {
    const params = new URLSearchParams()
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    if (filters?.user) params.set('user', filters.user)
    if (filters?.action) params.set('action', filters.action)
    const qs = params.toString()
    return request<import('../types').AuditLog[]>(`/admin/audit${qs ? '?' + qs : ''}`)
  },

  getDashboard: (filters?: { campaign?: string; date_from?: string; date_to?: string }) => {
    const params = new URLSearchParams()
    if (filters?.campaign) params.set('campaign', filters.campaign)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    const qs = params.toString()
    return request<import('../types').DashboardData>(`/reports/dashboard${qs ? '?' + qs : ''}`)
  },
  getReportsCampaigns: (filters?: { campaign?: string; date_from?: string; date_to?: string }) => {
    const params = new URLSearchParams()
    if (filters?.campaign) params.set('campaign', filters.campaign)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    const qs = params.toString()
    return request<import('../types').CampaignReport[]>(`/reports/campaigns${qs ? '?' + qs : ''}`)
  },
  getReportsProducts: (filters?: { campaign?: string; date_from?: string; date_to?: string }) => {
    const params = new URLSearchParams()
    if (filters?.campaign) params.set('campaign', filters.campaign)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    const qs = params.toString()
    return request<import('../types').ProductReport[]>(`/reports/products${qs ? '?' + qs : ''}`)
  },
  getReportsClassrooms: (filters?: { campaign?: string; date_from?: string; date_to?: string }) => {
    const params = new URLSearchParams()
    if (filters?.campaign) params.set('campaign', filters.campaign)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    const qs = params.toString()
    return request<import('../types').ClassroomReport[]>(`/reports/classrooms${qs ? '?' + qs : ''}`)
  },
  getReportsFinancial: (filters?: { campaign?: string; date_from?: string; date_to?: string }) => {
    const params = new URLSearchParams()
    if (filters?.campaign) params.set('campaign', filters.campaign)
    if (filters?.date_from) params.set('date_from', filters.date_from)
    if (filters?.date_to) params.set('date_to', filters.date_to)
    const qs = params.toString()
    return request<import('../types').FinancialReport>(`/reports/financial${qs ? '?' + qs : ''}`)
  },
  exportExcel: () => fetchCsrfToken().then(token =>
    fetch(`${BASE}/reports/export/excel`, {
      credentials: 'include',
      headers: { 'X-CSRFToken': token },
    }).then(r => r.blob())),
  exportPdf: () => fetchCsrfToken().then(token =>
    fetch(`${BASE}/reports/export/pdf`, {
      credentials: 'include',
      headers: { 'X-CSRFToken': token },
    }).then(r => r.blob())),
}
