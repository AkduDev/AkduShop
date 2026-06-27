import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().min(1, 'Email es requerido').email('Email inválido'),
  password: z.string().min(1, 'Contraseña es requerida'),
})

export const registerSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100),
  email: z.string().min(1, 'Email es requerido').email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  phone: z.string().max(20).optional().nullable(),
  address: z.string().max(200).optional().nullable(),
})

export const productSchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(200),
  description: z.string().max(2000).optional().nullable(),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  discountPrice: z.coerce.number().positive().optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
  categoryId: z.string().min(1, 'Categoría es requerida'),
  stock: z.coerce.number().int().min(0, 'El stock no puede ser negativo').optional().default(0),
  featured: z.boolean().optional().default(false),
  onSale: z.boolean().optional().default(false),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Nombre es requerido').max(100),
  description: z.string().max(500).optional().nullable(),
  imageUrl: z.string().max(500).optional().nullable(),
})

export const orderItemSchema = z.object({
  productId: z.string().min(1, 'ProductId es requerido'),
  quantity: z.coerce.number().int().positive('La cantidad debe ser mayor a 0'),
})

export const createOrderSchema = z.object({
  notes: z.string().max(500).optional().nullable(),
  items: z.array(orderItemSchema).min(1, 'Debe haber al menos un producto'),
})

export const orderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'], {
    message: 'Estado inválido',
  }),
})

export type LoginInput = z.infer<typeof loginSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type ProductInput = z.infer<typeof productSchema>
export type CategoryInput = z.infer<typeof categorySchema>
export type CreateOrderInput = z.infer<typeof createOrderSchema>
export type OrderStatusInput = z.infer<typeof orderStatusSchema>
