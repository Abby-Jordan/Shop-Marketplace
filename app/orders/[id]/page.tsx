"use client"

import { useQuery, gql } from "@apollo/client"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Package, Truck, CheckCircle, XCircle, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { formatDate } from "@/lib/utils"
import { OrderStatus, PaymentStatus } from "../../../graphql/graphql-types"
import { useAuth } from "@/context/AuthContext"
import { useParams, useRouter } from "next/navigation"
import { useEffect } from "react"
import { ORDER_QUERY } from "@/graphql/queries"

export default function OrderDetailPage() {
  const params = useParams()
  const { id } = params
  const { user } = useAuth()
  const router = useRouter()

  const { data, loading, error } = useQuery(ORDER_QUERY, {
    variables: { id },
    fetchPolicy: "network-only",
  })

  useEffect(() => {
    if (!user) {
      router.push("/auth?redirect=/orders")
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>
          </Button>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4">
                      <Skeleton className="h-16 w-16 rounded" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">Error loading order details. Please try again later.</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const order = data?.order

  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button variant="ghost" className="mb-4" asChild>
            <Link href="/orders">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">Order not found.</p>
            <Button className="bg-red-600 hover:bg-red-700" asChild>
              <Link href="/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case OrderStatus.Processing:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case OrderStatus.Shipped:
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      case OrderStatus.Delivered:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case OrderStatus.Cancelled:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.Paid:
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case PaymentStatus.Pending:
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
      case PaymentStatus.Failed:
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
      case PaymentStatus.Refunded:
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Pending:
        return <Package className="h-5 w-5" />
      case OrderStatus.Processing:
        return <Package className="h-5 w-5" />
      case OrderStatus.Shipped:
        return <Truck className="h-5 w-5" />
      case OrderStatus.Delivered:
        return <CheckCircle className="h-5 w-5" />
      case OrderStatus.Cancelled:
        return <XCircle className="h-5 w-5" />
      default:
        return <Package className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/orders">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Order #{order.id.slice(-6)}</h1>
            <p className="text-gray-600 dark:text-gray-400">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} px-4 py-2 flex items-center gap-2`}>
            {getStatusIcon(order.status)}
            {order.status}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.orderItems.map((item: any) => (
                  <div key={item.id} className="flex items-start gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                    <div className="relative h-20 w-20 rounded overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <Image
                        src={item.product.image || "/placeholder.svg?height=100&width=100"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Category: {item.product.category.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {item.size && `Size: ${item.size}`} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">₹{item.price * item.quantity}</p>
                          {item.product.discountedPrice && (
                            <p className="text-sm text-gray-500 line-through">
                              ₹{item.product.price * item.quantity}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="font-medium">{order.user.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{order.user.email}</p>
                    {order.user.phoneNumber && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Phone: {order.user.phoneNumber}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Address</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.address}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
              </p>
              <p>Phone: {order.shippingAddress.phone}</p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span>₹{(order.totalAmount - order.shippingFee).toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Shipping Fee</span>
                  <span>{order.shippingFee === 0 ? "Free" : `₹${order.shippingFee.toFixed(2)}`}</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{order.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Payment Status</span>
                  <Badge className={getPaymentStatusColor(order.paymentStatus)}>{order.paymentStatus}</Badge>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                  <span>{order.paymentMethod}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
                  <span>{formatDate(order.updatedAt)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button className="w-full bg-red-600 hover:bg-red-700" asChild>
            <Link href={`mailto:support@shreemahakalidairy.com?subject=Order%20${order.id}`}>
              Contact Support
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
