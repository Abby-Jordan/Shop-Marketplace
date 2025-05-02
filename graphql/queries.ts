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

export const ME_QUERY = gql`
  query Me {
    me {
      id
      name
      email
      role
      status
    }
  }
`

export const ORDERS_QUERY = gql`
  query Orders {
    orders {
      id
      status
      totalAmount
      shippingFee
      paymentMethod
      paymentStatus
      createdAt
      user {
        id
        name
        email
      }
      orderItems {
        id
        quantity
        product {
          name
        }
      }
    }
  }
`

export const ORDER_DETAILS_QUERY = gql`
  query Order($id: ID!) {
    order(id: $id) {
      id
      status
      totalAmount
      shippingFee
      paymentMethod
      paymentStatus
      shippingAddress{
        address
        city
        state
        postalCode
      }
      createdAt
      user {
        id
        name
        email
        phoneNumber
      }
      orderItems {
        id
        quantity
        price
        product {
          id
          name
          description
          image
        }
      }
    }
  }
`

export const DASHBOARD_QUERY = gql`
  query DashboardQuery($take: Int, $orderBy: OrderOrderByInput, $where: UserWhereInput) {
    orderCount
    userCount(where: $where)
    productCount
    orders(take: $take, orderBy: $orderBy) {
      id
      status
      totalAmount
      user {
       name
      }
    }
}
` 