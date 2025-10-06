import type React from "react"
export interface CartItem {
  id: string
  name: string
  price: number
  category: string
}

export interface Service {
  title: string
  description: string
  icon: React.ReactNode
}

export interface BannerSlide {
  title: string
  description: string
  image: string
}

export interface Milestone {
  label: string
  value: number
  key: string
}

export interface AuthForm {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  company: string
}

export interface CalculatorFields {
  urgency: string
  complexity: string
  additionalServices: boolean
  consultationHours: number
}

export interface ServiceFields {
  // Patent fields
  patentField1: string
  patentField2: string
  patentField3: string
  patentField4: string
  patentField5: string

  // Trademark fields
  trademarkField1: string
  trademarkField2: string
  trademarkField3: string
  trademarkField4: string
  trademarkField5: string

  // Copyright fields
  copyrightField1: string
  copyrightField2: string
  copyrightField3: string
  copyrightField4: string
  copyrightField5: string

  // Design fields
  designField1: string
  designField2: string
  designField3: string
  designField4: string
  designField5: string
}

export interface Counters {
  patents: number
  trademarks: number
  copyrights: number
  clients: number
}

// Admin / Orders types
export interface AdminOrderRow {
  id: number
  created_at: string
  service_id: number | null
  category_id: number | null
  payment_id: number | null
  type: string | null
  amount: number | null
  user_id: string | null
  assigned_to?: string | null
  responsible?: string | null
  workflow_status?: string | null
  require_info_message?: string | null
  require_info_reply?: string | null
  services?: { id: number; name: string } | null
  categories?: { id: number; name: string } | null
  payments?: { id: number; razorpay_payment_id?: string | null; total_amount?: number | null; payment_status?: string | null; payment_date?: string | null; type?: string | null } | null
  user?: { id: string; email: string; first_name?: string | null; last_name?: string | null; company?: string | null } | null
}

// Order chat messages
export interface OrderMessage {
  id: string
  order_id: number
  sender_role: 'admin' | 'user'
  sender_email: string | null
  message: string
  created_at: string
}
