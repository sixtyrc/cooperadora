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
