// This file contains functions for fetching data from the API

import type { Product } from "@/types/product"

// Mock data for development - will be replaced with actual API calls
const mockProducts: Product[] = [
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
    nutritionFacts: {
      calories: "65 kcal per 100ml",
      protein: "3.3g per 100ml",
      fat: "3.5g per 100ml",
      carbohydrates: "4.7g per 100ml",
      calcium: "120mg per 100ml",
    },
    features: [
      "No preservatives added",
      "Rich in calcium and protein",
      "Pasteurized for safety",
      "Sourced from grass-fed cows",
    ],
    reviews: [
      { name: "Rahul S.", rating: 5, comment: "Best milk I've had in years. Very fresh and tasty." },
      { name: "Priya M.", rating: 4, comment: "Good quality milk, my kids love it." },
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

const categories = [
  {
    id: "dairy",
    name: "Dairy Products",
    description: "Fresh and pure dairy products including milk, curd, paneer, and more.",
  },
  {
    id: "sweets",
    name: "Sweets",
    description: "Traditional Indian sweets made with pure ingredients and authentic recipes.",
  },
  {
    id: "namkeen",
    name: "Namkeen",
    description: "Savory snacks and mixtures perfect for any time of the day.",
  },
]

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Get products by category
export async function getProductsByCategory(categoryId: string, limit?: number): Promise<Product[]> {
  // Simulate API call
  await delay(500)

  let filteredProducts = mockProducts.filter((product) => product.categoryId === categoryId)

  if (limit) {
    filteredProducts = filteredProducts.slice(0, limit)
  }

  return filteredProducts
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  // Simulate API call
  await delay(300)

  const product = mockProducts.find((product) => product.id === id)
  return product || null
}

// Get related products
export async function getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
  // Simulate API call
  await delay(500)


  const totalRelatedProducts = mockProducts
    .filter((product) => product.categoryId === categoryId && product.id !== productId).length 
    const totalRelatedProductsCount = totalRelatedProducts < 5 ? totalRelatedProducts : 4
    
  // Get products from the same category, excluding the current product
  let relatedProducts = mockProducts
    .filter((product) => product.categoryId === categoryId && product.id !== productId)
    .slice(0, totalRelatedProductsCount)

  // If we don't have enough related products, add some from other categories
  if (relatedProducts.length < totalRelatedProductsCount) {
    const otherProducts = mockProducts
      .filter((product) => product.categoryId !== categoryId && product.id !== productId)
      .slice(0, totalRelatedProductsCount - relatedProducts.length)

    relatedProducts = [...relatedProducts, ...otherProducts]
  }

  return relatedProducts
}

// Get category information
export async function getCategoryInfo(categoryId: string) {
  // Simulate API call
  await delay(200)

  return categories.find((category) => category.id === categoryId) || null
}

// Get all categories
export async function getAllCategories() {
  // Simulate API call
  await delay(200)

  return categories
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  // Simulate API call
  await delay(500)

  const lowercaseQuery = query.toLowerCase()

  return mockProducts.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) || product.description.toLowerCase().includes(lowercaseQuery),
  )
}
