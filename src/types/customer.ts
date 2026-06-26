export interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  address: string | null
  createdAt: string
  updatedAt: string
}

export interface CustomerRegisterData {
  name: string
  email: string
  phone?: string
  address?: string
  password: string
}

export interface CustomerLoginData {
  email: string
  password: string
}
