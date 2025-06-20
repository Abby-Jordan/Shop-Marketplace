"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/context/AuthContext"
import AdminProducts from "@/components/admin/AdminProducts"
import AdminOrders from "@/components/admin/AdminOrders"
import AdminUsers from "@/components/admin/AdminUsers"
import AdminDashboard from "@/components/admin/AdminDashboard"
import { Role } from "../../graphql/graphql-types"

function AdminContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isClient, setIsClient] = useState(false)
  const defaultTab = searchParams.get('tab') || 'dashboard'

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (isClient && !isLoading && (!user || user.role !== Role.Admin)) {
      router.push("/auth")
    }
  }, [user, isLoading, isClient, router])

  if (isLoading || !isClient) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (!user || user.role !== Role.Admin) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <AdminDashboard />
        </TabsContent>

        <TabsContent value="products">
          <AdminProducts />
        </TabsContent>

        <TabsContent value="orders">
          <AdminOrders />
        </TabsContent>

        <TabsContent value="users">
          <AdminUsers />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    }>
      <AdminContent />
    </Suspense>
  )
}
