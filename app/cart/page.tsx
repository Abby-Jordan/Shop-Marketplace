"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Plus, Minus, Trash2, ArrowRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"
import { initializePayment } from "@/lib/payment"
import { useMutation, gql } from "@apollo/client"

const CREATE_ORDER_MUTATION = gql`
  mutation CreateOrder(
    $orderItems: [OrderItemInput!]!
    $shippingAddress: ShippingAddressInput!
    $paymentMethod: String!
    $totalAmount: Float!
    $shippingFee: Float!
  ) {
    createOrder(
      orderItems: $orderItems
      shippingAddress: $shippingAddress
      paymentMethod: $paymentMethod
      totalAmount: $totalAmount
      shippingFee: $shippingFee
    ) {
      id
      status
      totalAmount
      shippingFee
      paymentMethod
      paymentStatus
      createdAt
    }
  }
`

export default function CartPage() {
  const { cart, addToCart, removeFromCart, clearCart, getCartTotal } = useCart()
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const [isProcessing, setIsProcessing] = useState(false)

  const [createOrder] = useMutation(CREATE_ORDER_MUTATION)

  const cartTotal = getCartTotal()
  const deliveryFee = cartTotal > 500 ? 0 : 40
  const totalAmount = cartTotal + deliveryFee

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to continue with checkout",
        variant: "destructive",
      })
      router.push("/auth?redirect=/cart")
      return
    }

    setIsProcessing(true)

    try {
      // Create a mock shipping address (in a real app, this would come from the user's profile or a form)
      const shippingAddress = {
        fullName: user.name,
        address: "123 Main St",
        city: "Mumbai",
        state: "Maharashtra",
        postalCode: "400001",
        phone: "9876543210",
      }

      // Create order items from cart
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
        price: item.size ? item.size.price : item.discountedPrice || item.price,
        size: item.size?.value,
      }))

      // Create the order in the database
      const { data } = await createOrder({
        variables: {
          orderItems,
          shippingAddress,
          paymentMethod: "CARD",
          totalAmount,
          shippingFee: deliveryFee,
        },
      })

      if (data?.createOrder) {
        // Initialize payment
        const paymentId = await initializePayment(totalAmount)

        // Redirect to checkout page
        router.push(`/checkout/${data.createOrder.id}?paymentId=${paymentId}`)
      } else {
        throw new Error("Failed to create order")
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Failed",
        description: "There was an error processing your checkout. Please try again.",
        variant: "destructive",
      })
      setIsProcessing(false)
    }
  }

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative w-32 h-32 text-gray-300 dark:text-gray-600">
            <ShoppingBag size={128} />
          </div>
          <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-md">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Button className="mt-4 bg-red-600 hover:bg-red-700">
            <Link href="/">Continue Shopping</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <div className="space-y-6">
              {cart.map((item) => (
                <div
                  key={`${item.id}-${item.size?.value || "default"}`}
                  className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-6 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0"
                >
                  <div className="relative h-24 w-24 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                    <Image
                      src={item.image || "/placeholder.svg?height=200&width=200"}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:justify-between">
                      <div>
                        <h3 className="font-medium text-lg">{item.name}</h3>
                        {item.size && (
                          <p className="text-gray-600 dark:text-gray-400 text-sm">Size: {item.size.label}</p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          Price: ₹{item.size ? item.size.price : item.discountedPrice || item.price}
                        </p>
                      </div>

                      <div className="flex items-center mt-2 sm:mt-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => removeFromCart(item.id, item.size?.value)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>

                        <span className="mx-3 font-medium">{item.quantity}</span>

                        <Button
                          size="icon"
                          className="h-8 w-8 bg-red-600 hover:bg-red-700"
                          onClick={() =>
                            addToCart(
                              item,
                              item.size,
                            )
                          }
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      <p className="font-medium">
                        ₹{(item.size ? item.size.price : item.discountedPrice || item.price) * item.quantity}
                      </p>

                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-0 h-auto"
                        onClick={() => removeFromCart(item.id, item.size?.value, true)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        <span className="text-sm">Remove</span>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-between">
              <Button variant="outline" onClick={() => clearCart()}>
                Clear Cart
              </Button>

              <Button variant="outline">
                <Link href="/" className="flex items-center">
                  Continue Shopping
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 sticky top-20">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Delivery Fee</span>
                <span>{deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}</span>
              </div>

              <Separator className="my-3" />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{totalAmount.toFixed(2)}</span>
              </div>

              {deliveryFee > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Add ₹{(500 - cartTotal).toFixed(2)} more to get free delivery
                </p>
              )}
            </div>

            <Button
              className="w-full mt-6 bg-red-600 hover:bg-red-700"
              onClick={handleCheckout}
              disabled={isProcessing}
            >
              {isProcessing ? "Processing..." : "Proceed to Checkout"}
              {!isProcessing && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>

            <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
              <p>We accept:</p>
              <div className="flex space-x-2 mt-1">
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-1">Visa</div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-1">Mastercard</div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-1">UPI</div>
                <div className="bg-gray-100 dark:bg-gray-700 rounded p-1">Paytm</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
