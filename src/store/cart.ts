import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  imageUrl: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getTotalItems: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (item, qty = 1) => {
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id)
          
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              )
            }
          }
          
          return {
            items: [...state.items, { ...item, quantity: qty }]
          }
        })
      },
      
      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id)
        }))
      },
      
      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity } : i
          )
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const state = get()
        return state.items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        )
      },
      
      getTotalItems: () => {
        const state = get()
        return state.items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'ecommerce-cart'
    }
  )
)
