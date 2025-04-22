import { getProductsByCategory } from "@/lib/api"
import ProductCard from "@/components/products/ProductCard"

interface FeaturedProductsProps {
  category: string
  count: number
}

export default async function FeaturedProducts({ category, count }: FeaturedProductsProps) {
  const products = await getProductsByCategory(category, count)

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
