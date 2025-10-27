"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// Define the structure of an item in the cart with its options
export interface CartItemWithOptions {
  id: string
  menuItemId: string
  name: string
  description: string
  price: number
  image: string
  quantity: number
  basePrice: number // Original price before extras
  selectedOptions: {
    [key: string]: string | string[] // Mapping of option groups to selected values
  }
  specialInstructions?: string
}

interface CartContextType {
  items: CartItemWithOptions[]
  addItem: (item: CartItemWithOptions) => void
  removeItem: (itemId: string) => void
  updateQuantity: (itemId: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
  getItemCount: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItemWithOptions[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart))
      } catch (error) {
        console.error("Error loading cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem("cart", JSON.stringify(items))
    } else {
      localStorage.removeItem("cart")
    }
  }, [items])

  const addItem = (newItem: CartItemWithOptions) => {
    setItems((prevItems) => {
      // Check if item with same options already exists
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.menuItemId === newItem.menuItemId &&
          JSON.stringify(item.selectedOptions) === JSON.stringify(newItem.selectedOptions)
      )

      if (existingItemIndex >= 0) {
        // Update quantity if it exists
        const updatedItems = [...prevItems]
        updatedItems[existingItemIndex].quantity += newItem.quantity
        return updatedItems
      } else {
        // Add new item
        return [...prevItems, newItem]
      }
    })
  }

  const removeItem = (itemId: string) => {
    setItems((prevItems) => prevItems.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }
    setItems((prevItems) =>
      prevItems.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  }

  const getItemCount = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

