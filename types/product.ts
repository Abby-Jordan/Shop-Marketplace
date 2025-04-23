export interface ProductSize {
  value: string
  label: string
  price: number
}

export interface ProductReview {
  id: string
  name: string
  rating: number
  comment: string
  createdAt: string
}

export interface ProductFeature {
  id: string
  text: string
}

export interface NutritionFact {
  id: string
  name: string
  value: string
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
  nutritionFacts?: NutritionFact[]
  features?: ProductFeature[]
  reviews?: ProductReview[]
}
