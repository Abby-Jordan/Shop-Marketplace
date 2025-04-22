import { Suspense } from "react"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getProductById } from "@/lib/api"
import AddToCartButton from "@/components/products/AddToCartButton"
import ProductDetails from "@/components/products/ProductDetails"
import RelatedProducts from "@/components/products/RelatedProducts"
import ProductSkeleton from "@/components/products/ProductSkeleton"
import type { Metadata } from "next"

interface ProductPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = params
  const product = await getProductById(id)

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} - Shree Mahakali Dairy`,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = params
  const product = await getProductById(id)

  if (!product) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="relative h-80 md:h-96 lg:h-[500px] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <Image
            src={product.image || "/placeholder.svg?height=600&width=600"}
            alt={product.name}
            fill
            className="object-cover"
            priority
          />
        </div>

        <div className="flex flex-col">
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

          <div className="flex items-center space-x-2 mb-4">
            <span className="text-2xl font-bold">₹{product.discountedPrice || product.price}</span>
            {product.discountedPrice && <span className="text-gray-500 line-through text-lg">₹{product.price}</span>}
            {product.discount > 0 && (
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

          <AddToCartButton product={product} />

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <ProductDetails product={product} />
          </div>
        </div>
      </div>

      <div className="mt-16">
        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
        <Suspense fallback={<ProductSkeleton count={4} />}>
          <RelatedProducts productId={id} categoryId={product.categoryId} />
        </Suspense>
      </div>
    </div>
  )
}
