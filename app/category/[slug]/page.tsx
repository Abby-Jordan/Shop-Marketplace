import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getCategoryInfo } from "@/lib/api"
import ProductGrid from "@/components/products/ProductGrid"
import ProductSkeleton from "@/components/products/ProductSkeleton"
import type { Metadata } from "next"

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = params
  const category = await getCategoryInfo(slug)

  if (!category) {
    return {
      title: "Category Not Found",
    }
  }

  return {
    title: `${category.name} - Shree Mahakali Dairy`,
    description: category.description,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = params
  const category = await getCategoryInfo(slug)

  if (!category) {
    notFound()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{category.name}</h1>
        <p className="text-gray-600 dark:text-gray-400">{category.description}</p>
      </div>

      <Suspense fallback={<ProductSkeleton count={8} />}>
        <ProductGrid categoryId={category.id} />
      </Suspense>
    </div>
  )
}
