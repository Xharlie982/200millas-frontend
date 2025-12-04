// Type definitions for API communication
export interface Order {
  order_id: string
  customer_id: string
  customer_email?: string
  items: OrderItem[]
  status: OrderStatus
  total: number
  created_at: number
  updated_at: number
  delivery_address: string
  delivery_instructions?: string
  assigned_chef?: string
  assigned_driver?: string
  workflow?: {
    current_status: string
    steps: WorkflowStep[]
    progress?: {
      total_steps: number
      completed_steps: number
      percentage: number
    }
    estimated_time?: string
  }
}

export interface OrderItem {
  item_id: string
  name: string
  quantity: number
  price: number
  specialInstructions?: string
}

export type OrderStatus = "pending" | "confirmed" | "cooking" | "packing" | "ready" | "in_delivery" | "delivered" | "failed"

export interface WorkflowStep {
  id: string
  orderId: string
  stepType: "cooking" | "packing" | "delivery"
  status: "pending" | "in_progress" | "completed"
  assignedTo?: string
  startTime?: string
  endTime?: string
  notes?: string
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  available: boolean
  configuracionOpciones?: OptionConfig[]
}

export interface OptionConfig {
  id: string
  name: string
  type: "radio" | "checkbox" | "number"
  required: boolean
  options: {
    id: string
    name: string
    price: number
    image?: string
  }[]
  maxSelections?: number
  defaultSelection?: string
}

export interface MenuCategory {
  id: string
  name: string
  description?: string
  image?: string
}

export interface User {
  email: string
  name: string
  userType: "customer" | "chef" | "driver" | "admin" | "staff"
  tenantId: string
  phone?: string
  address?: string
  preferences?: Record<string, any>
  created_at?: number
}

export interface DashboardSummary {
  totalOrders: number
  pendingOrders: number
  completedOrders: number
  totalRevenue: number
  averageOrderTime: number
}
