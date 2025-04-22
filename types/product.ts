export interface ProductSize {
  value: string
  label: string
  price: number
}

export interface ProductReview {
  name: string
  rating: number
  comment: string
}

export interface NutritionFacts {
  [key: string]: string
}

export interface Product {
  id: string
  name: string
  description: string
  longDescription?: string
  price: number
  discountedPrice?: number
  discount?: number
  image: string
  categoryId: string
  inStock: boolean
  sizes?: ProductSize[]
  nutritionFacts?: NutritionFacts
  features?: string[]
  reviews?: ProductReview[]
}
