import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function Hero() {
  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-50 to-red-100 dark:from-gray-800 dark:to-gray-700">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
              Fresh Dairy Products & Delicious Sweets
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-300">
              Experience the authentic taste of premium quality dairy products and handcrafted sweets delivered to your
              doorstep.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-red-600 hover:bg-red-700">
                <Link href="/category/dairy">Shop Dairy</Link>
              </Button>
              <Button size="lg" variant="outline">
                <Link href="/category/sweets">Explore Sweets</Link>
              </Button>
            </div>
          </div>
          <div className="relative h-64 sm:h-80 md:h-96 rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=600&width=800"
              alt="Dairy and Sweets Collection"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
