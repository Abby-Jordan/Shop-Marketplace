"use client"

import { useState, use } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/context/CartContext"
import { processPayment } from "@/lib/payment"
import { useMutation, gql } from "@apollo/client"

type PageParams = {
  orderId: string
}

const UPDATE_PAYMENT_STATUS_MUTATION = gql`
  mutation UpdatePaymentStatus($id: ID!, $status: PaymentStatus!) {
    updatePaymentStatus(id: $id, status: $status) {
      id
      paymentStatus
    }
  }
`

export default function CheckoutPage({ params }: { params: Promise<PageParams> }) {
  const { orderId } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get("paymentId")
  const { toast } = useToast()
  const { clearCart } = useCart()

  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed">("pending")
  const [isProcessing, setIsProcessing] = useState(false)

  const [updatePaymentStatus] = useMutation(UPDATE_PAYMENT_STATUS_MUTATION)

  // Simulate payment processing
  const handleCompletePayment = async () => {
    setIsProcessing(true)

    try {
      const result = await processPayment(orderId, {
        // In a real app, this would include payment details
        method: "card",
        paymentId,
      })

      if (result.success) {
        // Update payment status in the database
        await updatePaymentStatus({
          variables: {
            id: orderId,
            status: "PAID",
          },
        })

        setPaymentStatus("success")
        clearCart()
        toast({
          title: "Payment Successful",
          description: "Your order has been placed successfully.",
        })
      } else {
        // Update payment status in the database
        await updatePaymentStatus({
          variables: {
            id: orderId,
            status: "FAILED",
          },
        })

        setPaymentStatus("failed")
        toast({
          title: "Payment Failed",
          description: result.message,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Payment error:", error)
      setPaymentStatus("failed")
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          <CardDescription>Complete your payment to place your order</CardDescription>
        </CardHeader>

        <CardContent>
          {paymentStatus === "pending" && (
            <div className="space-y-6">
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-2">Order Summary</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Order ID: {orderId}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Payment ID: {paymentId}</p>
              </div>

              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Payment Method</h3>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      id="card"
                      name="payment-method"
                      className="rounded border-gray-300"
                      defaultChecked
                    />
                    <label htmlFor="card">Credit/Debit Card</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="radio" id="upi" name="payment-method" className="rounded border-gray-300" />
                    <label htmlFor="upi">UPI</label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input type="radio" id="cod" name="payment-method" className="rounded border-gray-300" />
                    <label htmlFor="cod">Cash on Delivery</label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {paymentStatus === "success" && (
            <div className="text-center py-6">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your order has been placed successfully. You will receive a confirmation email shortly.
              </p>
              <p className="font-medium">Order ID: {orderId}</p>
            </div>
          )}

          {paymentStatus === "failed" && (
            <div className="text-center py-6">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Payment Failed</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                There was an error processing your payment. Please try again or choose a different payment method.
              </p>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          {paymentStatus === "pending" && (
            <>
              <Button variant="outline" onClick={() => router.push("/cart")} disabled={isProcessing}>
                Back to Cart
              </Button>

              <Button className="bg-red-600 hover:bg-red-700" onClick={handleCompletePayment} disabled={isProcessing}>
                {isProcessing ? "Processing..." : "Complete Payment"}
              </Button>
            </>
          )}

          {paymentStatus === "success" && (
            <Button className="w-full bg-red-600 hover:bg-red-700" onClick={() => router.push("/")}>
              Continue Shopping
            </Button>
          )}

          {paymentStatus === "failed" && (
            <>
              <Button variant="outline" onClick={() => router.push("/cart")}>
                Back to Cart
              </Button>

              <Button className="bg-red-600 hover:bg-red-700" onClick={() => setPaymentStatus("pending")}>
                Try Again
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
