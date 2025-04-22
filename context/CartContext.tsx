"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, ProductSize } from "@/types/product"

export interface CartItem extends Product {
  quantity: number
  size?: ProductSize
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, size?: ProductSize | null) => void
  removeFromCart: (productId: string, sizeValue?: string, removeAll?: boolean) => void
  clearCart: () => void
  getItemQuantity: (productId: string, sizeValue?: string) => number
  getCartTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem("cart")
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart))
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error)
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart))
  }, [cart])

  const addToCart = (product: Product, size?: ProductSize | null) => {
    setCart((prevCart) => {
      // Check if the product with the same size already exists in the cart
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === product.id && (!size ? !item.size : item.size?.value === size.value),
      )

      if (existingItemIndex !== -1) {
        // If it exists, update the quantity
        const updatedCart = [...prevCart]
        updatedCart[existingItemIndex] = {
          ...updatedCart[existingItemIndex],
          quantity: updatedCart[existingItemIndex].quantity + 1,
        }
        return updatedCart
      } else {
        // If it doesn't exist, add a new item
        return [...prevCart, { ...product, quantity: 1, size: size || undefined }]
      }
    })
  }

  const removeFromCart = (productId: string, sizeValue?: string, removeAll = false) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.findIndex(
        (item) => item.id === productId && (!sizeValue ? !item.size : item.size?.value === sizeValue),
      )

      if (existingItemIndex === -1) return prevCart

      const updatedCart = [...prevCart]
      const item = updatedCart[existingItemIndex]

      if (removeAll || item.quantity === 1) {
        // Remove the item completely
        updatedCart.splice(existingItemIndex, 1)
      } else {
        // Decrease the quantity
        updatedCart[existingItemIndex] = {
          ...item,
          quantity: item.quantity - 1,
        }
      }

      return updatedCart
    })
  }

  const clearCart = () => {
    setCart([])
  }

  const getItemQuantity = (productId: string, sizeValue?: string) => {
    const item = cart.find(
      (item) => item.id === productId && (!sizeValue ? !item.size : item.size?.value === sizeValue),
    )
    return item ? item.quantity : 0
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => {
      const price = item.size ? item.size.price : item.discountedPrice || item.price
      return total + price * item.quantity
    }, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        getItemQuantity,
        getCartTotal,
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
