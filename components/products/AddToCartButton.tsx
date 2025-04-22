"use client"

import { useState } from "react"
import { Plus, Minus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import type { Product, ProductSize } from "@/types/product"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface AddToCartButtonProps {
  product: Product
}

export default function AddToCartButton({ product }: AddToCartButtonProps) {
  const { addToCart, removeFromCart, getItemQuantity } = useCart()
  const { toast } = useToast()
  const [selectedSize, setSelectedSize] = useState<ProductSize | null>(
    product.sizes && product.sizes.length > 0 ? product.sizes[0] : null,
  )

  const quantity = getItemQuantity(product.id, selectedSize?.value)

  const handleAddToCart = () => {
    addToCart(product, selectedSize)
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
      duration: 2000,
    })
  }

  const handleRemoveFromCart = () => {
    removeFromCart(product.id, selectedSize?.value)
  }

  return (
    <div className="space-y-4">
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Select Size</h3>
          <RadioGroup
            value={selectedSize?.value || ""}
            onValueChange={(value) => {
              const size = product.sizes?.find((s) => s.value === value)
              setSelectedSize(size || null)
            }}
            className="flex flex-wrap gap-3"
          >
            {product.sizes.map((size) => (
              <div key={size.value} className="flex items-center space-x-2">
                <RadioGroupItem value={size.value} id={`size-${size.value}`} />
                <Label htmlFor={`size-${size.value}`} className="cursor-pointer">
                  {size.label} - ₹{size.price}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      <div className="flex items-center space-x-4">
        {quantity === 0 ? (
          <Button size="lg" onClick={handleAddToCart} className="bg-red-600 hover:bg-red-700 w-full">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Add to Cart
          </Button>
        ) : (
          <div className="flex items-center space-x-4 w-full">
            <Button variant="outline" size="icon" onClick={handleRemoveFromCart}>
              <Minus className="h-4 w-4" />
            </Button>

            <span className="font-medium text-lg">{quantity}</span>

            <Button size="icon" className="bg-red-600 hover:bg-red-700" onClick={handleAddToCart}>
              <Plus className="h-4 w-4" />
            </Button>

            <Button variant="outline" size="lg" className="ml-4 flex-grow" onClick={handleAddToCart}>
              Update Cart
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
