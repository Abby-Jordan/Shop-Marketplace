"use client"
import Image from "next/image"
import Link from "next/link"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/product"
import { Role } from "@/graphql/graphql-types"
import { useAuth } from "@/context/AuthContext"
interface ProductCardProps {
  product: Product
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, removeFromCart, getItemQuantity } = useCart()
  const { toast } = useToast()
  const { user } = useAuth()
  const quantity = getItemQuantity(product.id)

  const handleAddToCart = () => {
    addToCart(product)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    })
  }

  const handleRemoveFromCart = () => {
    removeFromCart(product.id)
  }

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md">
      <div className="relative h-48 w-full bg-gray-100 dark:bg-gray-800">
        <Link href={`/product/${product.id}`}>
          <Image
            src={product.image || "/placeholder.svg?height=300&width=300"}
            alt={product.name}
            fill
            className="object-cover"
          />
          {product.discount && product.discount > 0 && <Badge className="absolute top-2 right-2 bg-red-600">{product.discount}% OFF</Badge>}
        </Link>
      </div>

      <CardContent className="p-4 flex flex-col flex-grow">
        <Link href={`/product/${product.id}`} className="group">
          <h3 className="font-medium text-lg mb-1 group-hover:text-red-600 transition-colors">{product.name}</h3>
        </Link>

        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2 flex-grow">{product.description}</p>

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg">₹{product.discountedPrice || product.price}</span>
            {product.discountedPrice && <span className="text-gray-500 line-through text-sm">₹{product.price}</span>}
          </div>

          {(!user || (user && user.role !== Role.Admin)) && (quantity === 0 ? (
            <Button size="sm" onClick={handleAddToCart} className="bg-red-600 hover:bg-red-700">
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          ) : (
            <div className="flex items-center space-x-2">
              <Button size="icon" variant="outline" className="h-8 w-8 rounded-full" onClick={handleRemoveFromCart}>
                <Minus className="h-3 w-3" />
              </Button>

              <span className="font-medium">{quantity}</span>

              <Button
                size="icon"
                className="h-8 w-8 rounded-full bg-red-600 hover:bg-red-700"
                onClick={handleAddToCart}
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
