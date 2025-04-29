"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Eye } from "lucide-react"
import { OrderStatus } from "../../graphql/graphql-types"

// Mock orders data
const mockOrders = Array.from({ length: 20 }).map((_, i) => ({
  id: `ORD${1000 + i}`,
  customer: `Customer ${i + 1}`,
  date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  total: Math.floor(Math.random() * 2000) + 200,
  status: [OrderStatus.Pending, OrderStatus.Processing, OrderStatus.Shipped, OrderStatus.Delivered, OrderStatus.Cancelled][Math.floor(Math.random() * 5)],
  items: Math.floor(Math.random() * 5) + 1,
}))

export default function AdminOrders() {
  const [orders, setOrders] = useState(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

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

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>₹{order.total}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredOrders.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
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
