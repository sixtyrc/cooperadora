export interface Institution {
  id: number
  name: string
  logo: string | null
  primary_color: string
  secondary_color: string
  phone: string
  whatsapp: string
  address: string
  social_links: Record<string, string>
  welcome_message: string
}

export interface Campaign {
  id: number
  name: string
  slug: string
  description: string
  image: string | null
  color: string
  start_date: string | null
  end_date: string | null
  is_visible: boolean
  is_active: boolean
  status: string
}

export interface Product {
  id: number
  name: string
  description: string
  price: string
  image: string | null
  order: number
}

export interface OrderItem {
  product: number
  quantity: number
}

export interface OrderItemDetail {
  id: number
  product: number
  product_detail: Product
  quantity: number
  unit_price: string
  subtotal: string
}

export interface Order {
  id: number
  code: string
  campaign: number
  customer_name: string
  phone: string
  student_name: string
  classroom: string
  notes: string
  total: string
  status: string
  status_display: string
  items: OrderItemDetail[]
  created_at: string
}

export interface OrderCreatePayload {
  campaign: number
  customer_name: string
  phone: string
  student_name: string
  classroom: string
  notes: string
  items: OrderItem[]
}

export interface OrderCreateResponse {
  code: string
  total: string
}

export interface AdminOrder {
  id: number
  code: string
  campaign: number
  customer_name: string
  phone: string
  student_name: string
  classroom: string
  notes: string
  total: string
  status: string
  status_display: string
  items: OrderItemDetail[]
  created_at: string
  updated_at: string
}

export interface Payment {
  id: number
  order: number
  method: string
  voucher: string | null
  status: string
  status_display: string
  notes: string
  created_at: string
}

export interface Delivery {
  id: number
  order: number
  order_code: string
  user: number
  user_name: string
  delivered_at: string
  notes: string
}

export interface User {
  id: number
  username: string
  first_name: string
  last_name: string
  email: string
  role: string
  is_active: boolean
  last_login: string | null
}

export interface AuditLog {
  id: number
  username: string
  action: string
  details: string
  ip_address: string
  created_at: string
}

export interface DashboardData {
  total_orders: number
  total_sales: string
  total_collected: string
  pending_amount: string
  pending_deliveries: number
  orders_by_status: Record<string, number>
  latest_orders: AdminOrder[]
}

export interface CampaignReport {
  id: number
  name: string
  slug: string
  total_orders: number
  total_sales: string
  total_collected: string
  pending_amount: string
}

export interface ProductReport {
  id: number
  name: string
  campaign: string
  total_quantity: number
  total_revenue: string
  average_price: string
}

export interface ClassroomReport {
  classroom: string
  total_orders: number
  total_amount: string
}
