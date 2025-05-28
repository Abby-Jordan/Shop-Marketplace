"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Product, ProductSize } from "@/types/product"
import { useAuth } from "./AuthContext"

export interface CartItem extends Product {
  quantity: number
  size?: ProductSize
}

interface CartContextType {
  cart: CartItem[]
  addToCart: (product: Product, size?: ProductSize | null) => void
  removeFromCart: (productId: string, sizeValue?: string, removeAll?: boolean) => void
  clearCart: (isLogout?: boolean) => void
  getItemQuantity: (productId: string, sizeValue?: string) => number
  getCartTotal: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([])
  const { user } = useAuth()

  // Load cart from localStorage on initial render and when user changes
  useEffect(() => {
    if (user) {
      // Load user's cart
      const userCart = localStorage.getItem(`cart_${user.id}`)
      if (userCart) {
        try {
          setCart(JSON.parse(userCart))
        } catch (error) {
          console.error("Failed to parse user cart from localStorage:", error)
        }
      } else {
        // If no user cart exists, check for guest cart
        const guestCart = localStorage.getItem("guest_cart")
        if (guestCart) {
          try {
            setCart(JSON.parse(guestCart))
            // Save guest cart as user cart
            localStorage.setItem(`cart_${user.id}`, guestCart)
            // Clear guest cart
            localStorage.removeItem("guest_cart")
          } catch (error) {
            console.error("Failed to parse guest cart from localStorage:", error)
          }
        }
      }
    } else {
      // Load guest cart
      const guestCart = localStorage.getItem("guest_cart")
      if (guestCart) {
        try {
          setCart(JSON.parse(guestCart))
        } catch (error) {
          console.error("Failed to parse guest cart from localStorage:", error)
        }
      } else {
        setCart([])
      }
    }
  }, [user])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(`cart_${user.id}`, JSON.stringify(cart))
    } else {
      localStorage.setItem("guest_cart", JSON.stringify(cart))
    }
  }, [cart, user])

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

  const clearCart = (isLogout = false) => {
    if (isLogout && !user) {
      // Only clear guest cart on logout
      localStorage.removeItem("guest_cart")
      setCart([])
    } else if (!isLogout) {
      // Clear cart explicitly (e.g., after order complete)
      setCart([])
      if (user) {
        localStorage.removeItem(`cart_${user.id}`)
      } else {
        localStorage.removeItem("guest_cart")
      }
    }
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
