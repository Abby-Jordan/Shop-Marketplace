import { getRelatedProducts } from "@/lib/api"
import ProductCard from "@/components/products/ProductCard"

interface RelatedProductsProps {
  productId: string
  categoryId: string
}

export default async function RelatedProducts({ productId, categoryId }: RelatedProductsProps) {
  const products = await getRelatedProducts(productId, categoryId, 4)

  if (products.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
