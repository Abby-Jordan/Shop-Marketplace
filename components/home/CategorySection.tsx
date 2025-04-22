import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"

const categories = [
  {
    id: "dairy",
    name: "Dairy Products",
    description: "Fresh milk, curd, paneer, and more",
    image: "/placeholder.svg?height=300&width=300",
    color: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
  },
  {
    id: "sweets",
    name: "Sweets",
    description: "Traditional Indian sweets and desserts",
    image: "/placeholder.svg?height=300&width=300",
    color: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
  },
  {
    id: "namkeen",
    name: "Namkeen",
    description: "Savory snacks and mixtures",
    image: "/placeholder.svg?height=300&width=300",
    color: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
  },
]

export default function CategorySection() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {categories.map((category) => (
        <Link key={category.id} href={`/category/${category.id}`}>
          <Card
            className={`overflow-hidden transition-transform duration-300 hover:scale-105 bg-gradient-to-br ${category.color} border-0`}
          >
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden bg-white dark:bg-gray-800">
                  <Image src={category.image || "/placeholder.svg"} alt={category.name} fill className="object-cover" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{category.name}</h3>
                <p className="text-gray-600 dark:text-gray-300">{category.description}</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
