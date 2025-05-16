import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';
import { gql } from "graphql-tag"

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  enum Role {
    USER
    ADMIN
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  enum PaymentStatus {
    PENDING
    PAID
    FAILED
    REFUNDED
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    DEACTIVATED
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    status: UserStatus!
    profileImage: String
    phoneNumber: String
    bio: String
    address: Address
    preferences: JSON
    lastLoginAt: DateTime
    lastActivityAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    orders: [Order!]!
  }

  type Address {
    street: String!
    city: String!
    state: String!
    country: String!
    zipCode: String!
  }

  input UserWhereInput {
    status: UserStatus
  }


  type Category {
    id: ID!
    name: String!
    description: String!
    image: String
    products: [Product!]
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type ProductSize {
    id: ID!
    value: String!
    label: String!
    price: Float!
  }

  type NutritionFact {
    id: ID!
    name: String!
    value: String!
  }

  type Feature {
    id: ID!
    text: String!
  }

  type Review {
    id: ID!
    name: String!
    rating: Int!
    comment: String!
    createdAt: String!
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    longDescription: String
    price: Float!
    discountedPrice: Float
    discount: Int
    image: String!
    categoryId: ID!
    inStock: Boolean!
    createdAt: String!
    updatedAt: String!
    category: Category
    sizes: [ProductSize!]
    nutritionFacts: [NutritionFact!]
    features: [Feature!]
    reviews: [Review!]
  }

  type OrderItem {
    id: ID!
    productId: ID!
    quantity: Int!
    price: Float!
    size: String
    product: Product
  }

  type Order {
    id: ID!
    userId: ID!
    status: OrderStatus!
    totalAmount: Float!
    shippingFee: Float!
    shippingAddress: ShippingAddress!
    paymentMethod: String!
    paymentStatus: PaymentStatus!
    createdAt: String!
    updatedAt: String!
    user: User
    orderItems: [OrderItem!]!
  }

  input ShippingAddressInput {
    fullName: String!
    address: String!
    city: String!
    state: String!
    postalCode: String!
    phone: String!
  }

  type ShippingAddress {
    fullName: String!
    address: String!
    city: String!
    state: String!
    postalCode: String!
    phone: String!
  }

  input ProductSizeInput {
    value: String!
    label: String!
    price: Float!
  }

  input NutritionFactInput {
    name: String!
    value: String!
  }

  input FeatureInput {
    text: String!
  }

  input OrderItemInput {
    productId: ID!
    quantity: Int!
    price: Float!
    size: String
  }

  input OrderWhereInput {
    status: OrderStatus
  }

  input OrderOrderByInput {
    createdAt: SortDirection
  }

  enum SortDirection {
    asc
    desc
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  input ProductOrderByInput {
    field: String!
    direction: String!
  }

  input UserOrderByInput {
    field: String!
    direction: String!
  }

  type UserActivity {
    id: ID!
    userId: ID!
    type: String!
    details: JSON
    createdAt: DateTime!
  }

  input UpdateProfileInput {
    name: String
    phoneNumber: String
    bio: String
    profileImage: String
    address: AddressInput
    preferences: JSON
  }

  input AddressInput {
    street: String
    city: String
    state: String
    country: String
    zipCode: String
  }

  input CreateCategoryInput {
    name: String!
    description: String!
    image: String
  }

  input UpdateCategoryInput {
    name: String
    description: String
    image: String
  }

  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(orderBy: UserOrderByInput, where: UserWhereInput): [User!]!
    userActivity(userId: ID!): [UserActivity!]!
    userCount(where: UserWhereInput): Int!

    # Category queries
    categories: [Category!]!
    category(id: ID!): Category

    # Product queries
    products(orderBy: ProductOrderByInput): [Product!]!
    product(id: ID!): Product
    productsByCategory(categoryId: ID!): [Product!]!
    searchProducts(query: String!): [Product!]!
    productCount: Int!
    # Order queries
    orders(take: Int, orderBy: OrderOrderByInput): [Order!]!
    order(id: ID!): Order
    myOrders: [Order!]!
    orderCount(where: OrderWhereInput): Int!

  }

  type Mutation {
    # Auth mutations
    signup(name: String!, email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!

    # User mutations
    updateProfile(input: UpdateProfileInput!): User!
    updateUser(id: ID!, name: String, email: String, role: Role): User!
    updateUserStatus(id: ID!, status: UserStatus!): User!
    deleteUser(id: ID!): Boolean!

    # Category mutations
    createCategory(input: CreateCategoryInput!): Category!
    updateCategory(id: ID!, input: UpdateCategoryInput!): Category!
    deleteCategory(id: ID!): Boolean!

    # Product mutations
    createProduct(
      name: String!
      description: String!
      longDescription: String
      price: Float!
      discountedPrice: Float
      discount: Int
      image: String!
      categoryId: ID!
      inStock: Boolean!
      sizes: [ProductSizeInput!]
      nutritionFacts: [NutritionFactInput!]
      features: [FeatureInput!]
    ): Product!

    updateProduct(
      id: ID!
      name: String
      description: String
      longDescription: String
      price: Float
      discountedPrice: Float
      discount: Int
      image: String
      categoryId: ID
      inStock: Boolean
      sizes: [ProductSizeInput!]
      nutritionFacts: [NutritionFactInput!]
      features: [FeatureInput!]
    ): Product!

    deleteProduct(id: ID!): Boolean!

    # Review mutations
    addReview(productId: ID!, name: String!, rating: Int!, comment: String!): Review!

    # Order mutations
    createOrder(
      orderItems: [OrderItemInput!]!
      shippingAddress: ShippingAddressInput!
      paymentMethod: String!
      totalAmount: Float!
      shippingFee: Float!
    ): Order!

    updateOrderStatus(id: ID!, status: OrderStatus!): Order!
    updatePaymentStatus(id: ID!, status: PaymentStatus!): Order!

    # User activity mutations
    recordUserActivity(userId: ID!, type: String!, details: JSON): UserActivity!

    # User mutations
    addUser(name: String!, email: String!, isAdmin: Boolean!): User!

    # Change password mutation
    changePassword(oldPassword: String!, newPassword: String!): Boolean!

    # Forgot password mutation
    forgotPassword(email: String!): Boolean!

    # Reset password mutation
    resetPassword(token: String!, newPassword: String!): Boolean!
  }
`
