import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface WishlistItem {
  id: string
  name: string
  price: number
  discountPrice?: number | null
  imageUrl: string
  category: string
}

interface WishlistStore {
  items: WishlistItem[]
  addItem: (item: WishlistItem) => void
  removeItem: (id: string) => void
  toggleItem: (item: WishlistItem) => void
  isInWishlist: (id: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          if (state.items.some((i) => i.id === item.id)) return state
          return { items: [...state.items, item] }
        })
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }))
      },

      toggleItem: (item) => {
        const state = get()
        if (state.items.some((i) => i.id === item.id)) {
          state.removeItem(item.id)
        } else {
          state.addItem(item)
        }
      },

      isInWishlist: (id) => {
        return get().items.some((i) => i.id === id)
      },
    }),
    {
      name: 'ecommerce-wishlist',
    }
  )
)
