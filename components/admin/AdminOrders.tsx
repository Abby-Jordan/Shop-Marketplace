"use client"

import { useState } from "react"
import { useQuery, gql } from "@apollo/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"
import { OrderStatus, PaymentStatus } from "../../graphql/graphql-types"
import { formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"
import { ORDERS_QUERY } from "@/graphql/queries"

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()
  const { data, loading, error } = useQuery(ORDERS_QUERY)

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-[250px] bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-[200px] bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-red-500">
        Error loading orders: {error.message}
      </div>
    )
  }

  const orders = data.orders || []

  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Search orders..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value={OrderStatus.Pending}>Pending</SelectItem>
              <SelectItem value={OrderStatus.Processing}>Processing</SelectItem>
              <SelectItem value={OrderStatus.Shipped}>Shipped</SelectItem>
              <SelectItem value={OrderStatus.Delivered}>Delivered</SelectItem>
              <SelectItem value={OrderStatus.Cancelled}>Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order: any) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{order.user.name}</div>
                    <div className="text-sm text-gray-500">{order.user.email}</div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order.orderItems.length} items</TableCell>
                <TableCell>₹{(order.totalAmount + order.shippingFee).toFixed(2)}</TableCell>
                <TableCell>
                  <Badge variant={
                    order.status === OrderStatus.Pending ? "secondary" :
                    order.status === OrderStatus.Processing ? "default" :
                    order.status === OrderStatus.Shipped ? "outline" :
                    order.status === OrderStatus.Delivered ? "default" :
                    "destructive"
                  }>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={
                    order.paymentStatus === PaymentStatus.Pending ? "secondary" :
                    order.paymentStatus === PaymentStatus.Paid ? "default" :
                    order.paymentStatus === PaymentStatus.Failed ? "destructive" :
                    "outline"
                  }>
                    {order.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
