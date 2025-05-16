import { gql } from "@apollo/client"
import { client } from "@/lib/apollo-client"
import type { Product } from "@/types/product"

// GraphQL fragments
const PRODUCT_FRAGMENT = gql`
  fragment ProductFields on Product {
    id
    name
    description
    longDescription
    price
    discountedPrice
    discount
    image
    categoryId
    inStock
    createdAt
    updatedAt
    category {
      id
      name
    }
    sizes {
      id
      value
      label
      price
    }
    nutritionFacts {
      id
      name
      value
    }
    features {
      id
      text
    }
    reviews {
      id
      name
      rating
      comment
      createdAt
    }
  }
`

// Get products by category
export async function getProductsByCategory(categoryId: string, limit?: number): Promise<Product[]> {
  try {
    const { data } = await client.query({
      query: gql`
        query ProductsByCategory($categoryId: ID!) {
          productsByCategory(categoryId: $categoryId) {
            ...ProductFields
          }
        }
        ${PRODUCT_FRAGMENT}
      `,
      variables: { categoryId },
    })

    let products = data.productsByCategory || []

    if (limit) {
      products = products.slice(0, limit)
    }

    return products
  } catch (error) {
    console.error('Error fetching products by category:', error)
    return []
  }
}

// Get product by ID
export async function getProductById(id: string): Promise<Product | null> {
  try {
    const { data } = await client.query({
      query: gql`
        query Product($id: ID!) {
          product(id: $id) {
            ...ProductFields
          }
        }
        ${PRODUCT_FRAGMENT}
      `,
      variables: { id },
      fetchPolicy: 'no-cache',
    })

    return data.product || null
  } catch (error) {
    console.error('Error fetching product by ID:', error)
    return null
  }
}

// Get related products
export async function getRelatedProducts(productId: string, categoryId: string, limit = 4): Promise<Product[]> {
  try {
    const { data } = await client.query({
      query: gql`
        query ProductsByCategory($categoryId: ID!) {
          productsByCategory(categoryId: $categoryId) {
            ...ProductFields
          }
        }
        ${PRODUCT_FRAGMENT}
      `,
      variables: { categoryId },
    })

    // Filter out the current product and limit the results
    let relatedProducts = (data.productsByCategory || [])
      .filter((product: Product) => product.id !== productId)
      .slice(0, limit)

    // If we don't have enough related products, we could fetch some from other categories
    if (relatedProducts.length < limit) {
      const { data: moreData } = await client.query({
        query: gql`
          query Products {
            products {
              ...ProductFields
            }
          }
          ${PRODUCT_FRAGMENT}
        `,
      })

      const otherProducts = (moreData.products || [])
        .filter((product: Product) => product.id !== productId && product.categoryId !== categoryId)
        .slice(0, limit - relatedProducts.length)

      relatedProducts = [...relatedProducts, ...otherProducts]
    }

    return relatedProducts
  } catch (error) {
    console.error('Error fetching related products:', error)
    return []
  }
}

// Get category information
export async function getCategoryInfo(categoryId: string) {
  const { data } = await client.query({
    query: gql`
      query Category($id: ID!) {
        category(id: $id) {
          id
          name
          description
        }
      }
    `,
    variables: { id: categoryId },
  })

  return data.category
}

// Get all categories
export async function getAllCategories(limit?: number) {
  const { data } = await client.query({
    query: gql`
      query Categories {
        categories {
          id
          name
          description
          image
          products {
            id
            name
            description
            image
            
          }
        }
      }
    `,
  })
  let categories = data.categories

  if (limit) {
    categories = categories.slice(0, limit)
  }

  return categories
}

// Search products
export async function searchProducts(query: string): Promise<Product[]> {
  const { data } = await client.query({
    query: gql`
      query SearchProducts($query: String!) {
        searchProducts(query: $query) {
          ...ProductFields
        }
      }
      ${PRODUCT_FRAGMENT}
    `,
    variables: { query },
  })

  return data.searchProducts
}
