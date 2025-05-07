import { Suspense } from "react"
import Hero from "@/components/home/Hero"
import CategorySection from "@/components/home/CategorySection"
import FeaturedProducts from "@/components/home/FeaturedProducts"
import ProductSkeleton from "@/components/products/ProductSkeleton"
import AIChatButton from "@/components/chat/AIChatButton"
import { getAllCategories } from "@/lib/api"
import type { Category } from "@/graphql/graphql-types"

export default async function Home() {
  const categories = await getAllCategories()

  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />

      <section className="my-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Categories</h2>
        <CategorySection />
      </section>

      {categories.map((category: Category) => (
        <section key={category.id} className="my-12">
          <h2 className="text-3xl font-bold mb-8 text-center">{category.name}</h2>
          <Suspense fallback={<ProductSkeleton count={4} />}>
            <FeaturedProducts category={category.id} count={4} />
          </Suspense>
        </section>
      ))}

      <AIChatButton />
    </div>
  )
}
