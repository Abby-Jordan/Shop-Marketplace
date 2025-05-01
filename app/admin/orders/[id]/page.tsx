"use client"

import { useQuery, gql } from "@apollo/client"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Package, CreditCard, MapPin, User } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { OrderStatus, PaymentStatus } from "../../../../graphql/graphql-types"
import { useRouter } from "next/navigation"
import { ORDER_DETAILS_QUERY } from "@/graphql/queries"

export default function OrderDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { data, loading, error } = useQuery(ORDER_DETAILS_QUERY, {
    variables: { id: params.id }
  })

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
        <div className="grid gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading order details: {error.message}
      </div>
    )
  }

  const order = data.order

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 justify-between mb-2">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Order ID</p>
                <p className="font-medium">{order.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <Badge variant={
                  order.status === OrderStatus.Pending ? "secondary" :
                  order.status === OrderStatus.Processing ? "default" :
                  order.status === OrderStatus.Shipped ? "outline" :
                  order.status === OrderStatus.Delivered ? "default" :
                  "destructive"
                }>
                  {order.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Status</p>
                <Badge variant={
                  order.paymentStatus === PaymentStatus.Pending ? "secondary" :
                  order.paymentStatus === PaymentStatus.Paid ? "default" :
                  order.paymentStatus === PaymentStatus.Failed ? "destructive" :
                  "outline"
                }>
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Name</p>
              <p className="font-medium">{order.user.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{order.user.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{order.user.phone || "Not provided"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{order.shippingAddress.address}</p>
              <p className="text-gray-600">
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">Payment Method</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Subtotal</p>
              <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Shipping Fee</p>
              <p className="font-medium">₹{order.shippingFee.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Amount</p>
              <p className="font-medium text-lg">
                ₹{(order.totalAmount + order.shippingFee).toFixed(2)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.orderItems.map((item: any) => (
              <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                  {item.product.images?.[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{item.product.name}</h3>
                  <p className="text-sm text-gray-500">{item.product.description}</p>
                  <div className="mt-2 flex items-center gap-4">
                    <p className="text-sm">Quantity: {item.quantity}</p>
                    <p className="text-sm">Price: ₹{item.price.toFixed(2)}</p>
                    <p className="text-sm font-medium">
                      Total: ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 