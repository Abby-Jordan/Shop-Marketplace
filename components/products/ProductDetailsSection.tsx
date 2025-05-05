'use client'

import { Role } from "@/graphql/graphql-types"
import { useAuth } from "@/context/AuthContext"
import AddToCartButton from "./AddToCartButton"
import ProductDetails from "./ProductDetails"
import type { Product } from "@/graphql/graphql-types"

interface ProductDetailsSectionProps {
  product: Product
}

export default function ProductDetailsSection({ product }: ProductDetailsSectionProps) {
  const { user } = useAuth()

  return (
    <div className="flex flex-col">
      <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

      <div className="flex items-center space-x-2 mb-4">
        <span className="text-2xl font-bold">₹{product.discountedPrice || product.price}</span>
        {product.discountedPrice && <span className="text-gray-500 line-through text-lg">₹{product.price}</span>}
        {product.discount && product.discount > 0 && (
          <span className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-sm px-2 py-0.5 rounded">
            {product.discount}% OFF
          </span>
        )}
      </div>

      <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>

      <div className="mb-6">
        <h3 className="font-medium mb-2">Available Sizes</h3>
        <div className="flex flex-wrap gap-2">
          {product.sizes?.map((size) => (
            <div
              key={size.value}
              className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-1 text-sm"
            >
              {size.label} - ₹{size.price}
            </div>
          ))}
        </div>
      </div>

      {(!user || (user && user.role !== Role.Admin)) && <AddToCartButton product={product} />}

      <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
        <ProductDetails product={product} />
      </div>
    </div>
  )
} 