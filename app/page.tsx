import { Suspense } from "react"
import Hero from "@/components/home/Hero"
import CategorySection from "@/components/home/CategorySection"
import FeaturedProducts from "@/components/home/FeaturedProducts"
import ProductSkeleton from "@/components/products/ProductSkeleton"
import AIChatButton from "@/components/chat/AIChatButton"

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Hero />

      <section className="my-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Our Categories</h2>
        <CategorySection />
      </section>

      <section className="my-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Featured Dairy Products</h2>
        <Suspense fallback={<ProductSkeleton count={4} />}>
          <FeaturedProducts category="dairy" count={4} />
        </Suspense>
      </section>

      <section className="my-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Popular Sweets</h2>
        <Suspense fallback={<ProductSkeleton count={4} />}>
          <FeaturedProducts category="sweets" count={4} />
        </Suspense>
      </section>

      <section className="my-12">
        <h2 className="text-3xl font-bold mb-8 text-center">Namkeen Collection</h2>
        <Suspense fallback={<ProductSkeleton count={4} />}>
          <FeaturedProducts category="namkeen" count={4} />
        </Suspense>
      </section>

      <AIChatButton />
    </div>
  )
}
