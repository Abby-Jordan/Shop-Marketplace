import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us - Shop Marketplace",
  description: "Learn more about Shop Marketplace and our commitment to quality products.",
}

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold text-center mb-8">About Shop Marketplace</h1>
      
      <div className="space-y-8">
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Our Story</h2>
          <p className="text-gray-600 dark:text-gray-300">
            Founded in 2024, Shop Marketplace emerged from a simple yet powerful vision: to create a 
            seamless platform connecting consumers with the finest quality dairy products, sweets, and 
            namkeen. What started as a small initiative has grown into a trusted marketplace serving 
            thousands of satisfied customers.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Our Mission</h2>
          <p className="text-gray-600 dark:text-gray-300">
            We are committed to delivering exceptional quality products while ensuring the highest 
            standards of customer service. Our mission is to make premium dairy products, sweets, and 
            namkeen accessible to everyone while maintaining the authenticity and traditional flavors 
            that make these products special.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Quality Assurance</h2>
          <p className="text-gray-600 dark:text-gray-300">
            At Shop Marketplace, quality is non-negotiable. We work closely with our suppliers to 
            ensure that every product meets our stringent quality standards. From farm-fresh dairy 
            products to handcrafted sweets and authentic namkeen, we guarantee freshness, authenticity, 
            and satisfaction with every purchase.
          </p>
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-semibold">Our Values</h2>
          <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Quality First: We never compromise on the quality of our products</li>
            <li>Customer Satisfaction: Your happiness is our priority</li>
            <li>Authenticity: We preserve traditional flavors and recipes</li>
            <li>Innovation: We continuously improve our services and product offerings</li>
            <li>Community: We support local producers and sustainable practices</li>
          </ul>
        </section>
      </div>
    </div>
  )
} 