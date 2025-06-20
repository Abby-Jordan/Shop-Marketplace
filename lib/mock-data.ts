import type { Product } from "@/types/product"

// Mock products data for development
export const mockProducts: Product[] = [
  {
    id: "1",
    name: "Fresh Cow Milk",
    description: "Pure and fresh cow milk with rich taste and nutrients",
    longDescription:
      "Our fresh cow milk is sourced from healthy cows raised in natural environments. It is pasteurized to ensure safety while preserving its natural taste and nutritional benefits.",
    price: 60,
    discountedPrice: 55,
    discount: 8,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "dairy",
    inStock: true,
    sizes: [
      { value: "500ml", label: "500ml", price: 30 },
      { value: "1l", label: "1 Liter", price: 55 },
      { value: "2l", label: "2 Liters", price: 100 },
    ],
    nutritionFacts: [
      { id: "1", name: "Calories", value: "65 kcal per 100ml" },
      { id: "2", name: "Protein", value: "3.3g per 100ml" },
      { id: "3", name: "Fat", value: "3.5g per 100ml" },
      { id: "4", name: "Carbohydrates", value: "4.7g per 100ml" },
      { id: "5", name: "Calcium", value: "120mg per 100ml" }
    ],
    features: [
      { id: "1", text: "No preservatives added" },
      { id: "2", text: "Rich in calcium and protein" },
      { id: "3", text: "Pasteurized for safety" },
      { id: "4", text: "Sourced from grass-fed cows" }
    ],
    reviews: [
      { 
        id: "1",
        name: "Rahul S.", 
        rating: 5, 
        comment: "Best milk I've had in years. Very fresh and tasty.",
        createdAt: "2024-03-15T10:30:00Z"
      },
      { 
        id: "2",
        name: "Priya M.", 
        rating: 4, 
        comment: "Good quality milk, my kids love it.",
        createdAt: "2024-03-14T15:45:00Z"
      }
    ],
  },
  {
    id: "2",
    name: "Fresh Buffalo Milk",
    description: "Creamy buffalo milk with higher fat content",
    price: 80,
    discountedPrice: 75,
    discount: 6,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "dairy",
    inStock: true,
    sizes: [
      { value: "500ml", label: "500ml", price: 40 },
      { value: "1l", label: "1 Liter", price: 75 },
    ],
  },
  {
    id: "3",
    name: "Homemade Paneer",
    description: "Soft and fresh cottage cheese made from pure milk",
    price: 120,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "dairy",
    inStock: true,
    sizes: [
      { value: "250g", label: "250g", price: 120 },
      { value: "500g", label: "500g", price: 220 },
    ],
  },
  {
    id: "4",
    name: "Fresh Curd",
    description: "Thick and creamy curd made from fresh milk",
    price: 50,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "dairy",
    inStock: true,
    sizes: [
      { value: "200g", label: "200g", price: 25 },
      { value: "500g", label: "500g", price: 50 },
      { value: "1kg", label: "1kg", price: 90 },
    ],
  },
  {
    id: "5",
    name: "Gulab Jamun",
    description: "Soft milk-solid dumplings soaked in rose-flavored sugar syrup",
    price: 200,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "sweets",
    inStock: true,
    sizes: [
      { value: "500g", label: "500g (10 pcs)", price: 200 },
      { value: "1kg", label: "1kg (20 pcs)", price: 380 },
    ],
  },
  {
    id: "6",
    name: "Rasgulla",
    description: "Soft and spongy cottage cheese balls soaked in sugar syrup",
    price: 220,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "sweets",
    inStock: true,
    sizes: [
      { value: "500g", label: "500g (8 pcs)", price: 220 },
      { value: "1kg", label: "1kg (16 pcs)", price: 420 },
    ],
  },
  {
    id: "7",
    name: "Kaju Katli",
    description: "Diamond-shaped cashew fudge with silver varq",
    price: 600,
    discountedPrice: 550,
    discount: 8,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "sweets",
    inStock: true,
    sizes: [
      { value: "250g", label: "250g", price: 300 },
      { value: "500g", label: "500g", price: 550 },
      { value: "1kg", label: "1kg", price: 1050 },
    ],
  },
  {
    id: "8",
    name: "Jalebi",
    description: "Crispy, juicy, and sweet spiral-shaped dessert",
    price: 180,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "sweets",
    inStock: true,
    sizes: [
      { value: "250g", label: "250g", price: 180 },
      { value: "500g", label: "500g", price: 350 },
    ],
  },
  {
    id: "9",
    name: "Aloo Bhujia",
    description: "Crispy and spicy potato noodle snack",
    price: 120,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "namkeen",
    inStock: true,
    sizes: [
      { value: "200g", label: "200g", price: 120 },
      { value: "500g", label: "500g", price: 280 },
    ],
  },
  {
    id: "10",
    name: "Mixture",
    description: "Crunchy mix of various savory ingredients",
    price: 140,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "namkeen",
    inStock: true,
    sizes: [
      { value: "200g", label: "200g", price: 140 },
      { value: "500g", label: "500g", price: 320 },
    ],
  },
  {
    id: "11",
    name: "Boondi",
    description: "Small, crispy, and spicy fried droplets of gram flour",
    price: 130,
    discountedPrice: 110,
    discount: 15,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "namkeen",
    inStock: true,
    sizes: [
      { value: "200g", label: "200g", price: 110 },
      { value: "500g", label: "500g", price: 260 },
    ],
  },
  {
    id: "12",
    name: "Sev",
    description: "Thin, crispy noodles made from gram flour",
    price: 100,
    image: "/placeholder.svg?height=400&width=400",
    categoryId: "namkeen",
    inStock: true,
    sizes: [
      { value: "200g", label: "200g", price: 100 },
      { value: "500g", label: "500g", price: 230 },
    ],
  },
]
