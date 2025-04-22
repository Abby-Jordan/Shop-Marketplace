import { getProductsByCategory } from "@/lib/api"
import ProductCard from "@/components/products/ProductCard"

interface ProductGridProps {
  categoryId: string
}

export default async function ProductGrid({ categoryId }: ProductGridProps) {
  const products = await getProductsByCategory(categoryId)

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-xl font-medium text-gray-600 dark:text-gray-400">No products found in this category.</h3>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
