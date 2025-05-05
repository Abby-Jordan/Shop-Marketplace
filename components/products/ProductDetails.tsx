"use client"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Product } from "@/types/product"
import { useAuth } from "@/context/AuthContext"

interface ProductDetailsProps {
  product: Product
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const { user } = useAuth()
  return (
    <Tabs defaultValue="description" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="description">Description</TabsTrigger>
        <TabsTrigger value="nutrition">Nutrition Facts</TabsTrigger>
        <TabsTrigger value="reviews">Reviews</TabsTrigger>
      </TabsList>

      <TabsContent value="description" className="pt-4">
        <div className="prose dark:prose-invert max-w-none">
          <p>{product.longDescription || product.description}</p>

          {product.features && product.features.length > 0 && (
            <>
              <h3>Features</h3>
              <ul>
                {product.features.map((feature) => (
                  <li key={feature.id}>{feature.text}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      </TabsContent>

      <TabsContent value="nutrition" className="pt-4">
        {product.nutritionFacts && product.nutritionFacts.length > 0 ? (
          <div className="border border-gray-200 dark:border-gray-700 rounded-md p-4">
            <h3 className="font-bold text-lg mb-3">Nutrition Facts</h3>
            <div className="space-y-2">
              {product.nutritionFacts.map((fact) => (
                <div key={fact.id} className="flex justify-between border-b border-gray-200 dark:border-gray-700 py-2">
                  <span className="capitalize">{fact.name}</span>
                  <span className="font-medium">{fact.value}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">Nutrition information not available for this product.</p>
        )}
      </TabsContent>

      <TabsContent value="reviews" className="pt-4">
        {product.reviews && product.reviews.length > 0 ? (
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium">{review.name}</div>
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${i < review.rating ? "text-yellow-500" : "text-gray-300 dark:text-gray-600"}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No reviews yet for this product.</p>
        )}
      </TabsContent>
    </Tabs>
  )
}
