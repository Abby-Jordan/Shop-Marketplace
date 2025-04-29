import { gql } from '@apollo/client';

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
      status
      lastLoginAt
      lastActivityAt
      createdAt
      updatedAt
    }
  }
`;

export const GET_PRODUCTS_QUERY = gql`
  query GetProducts {
    products(orderBy: { field: "updatedAt", direction: "desc" }) {
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
    }
  }
`

export const GET_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`

export const GET_PROFILE = gql`
  query GetProfile {
    me {
      id
      name
      email
      role
      status
      profileImage
      phoneNumber
      address {
        street
        city
        state
        country
        zipCode
      }
      bio
      preferences
      lastLoginAt
      lastActivityAt
    }
  }
`;