import { gql } from '@apollo/client';

export const UPDATE_USER_STATUS = gql`
  mutation UpdateUserStatus($id: ID!, $status: UserStatus!) {
    updateUserStatus(id: $id, status: $status) {
      id
      status
    }
  }
`;

export const DELETE_USER = gql`
  mutation DeleteUser($id: ID!) {
    deleteUser(id: $id)
  }
`;

export const RECORD_USER_ACTIVITY = gql`
  mutation RecordUserActivity($userId: ID!, $type: String!, $details: JSON) {
    recordUserActivity(userId: $userId, type: $type, details: $details) {
      id
      type
      details
      createdAt
    }
  }
`; 

export const ADD_USER = gql`
  mutation AddUser($name: String!, $email: String!, $isAdmin: Boolean!) {
    addUser(name: $name, email: $email, isAdmin: $isAdmin) {
      id
      name
      email
    }
  }
`; 

export const DELETE_PRODUCT_MUTATION = gql`
   mutation DeleteProductMutation($deleteProductId: ID!) {
  deleteProduct(id: $deleteProductId)
}
`

export const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct(
    $name: String!
    $description: String!
    $longDescription: String
    $price: Float!
    $discountedPrice: Float
    $discount: Int
    $image: String!
    $categoryId: ID!
    $inStock: Boolean!
    $sizes: [ProductSizeInput!]
    $nutritionFacts: [NutritionFactInput!]
    $features: [FeatureInput!]
  ) {
    createProduct(
      name: $name
      description: $description
      longDescription: $longDescription
      price: $price
      discountedPrice: $discountedPrice
      discount: $discount
      image: $image
      categoryId: $categoryId
      inStock: $inStock
      sizes: $sizes
      nutritionFacts: $nutritionFacts
      features: $features
    ) {
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
export const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String
    $description: String
    $longDescription: String
    $price: Float
    $discountedPrice: Float
    $discount: Int
    $image: String
    $categoryId: ID
    $inStock: Boolean
    $sizes: [ProductSizeInput!]
    $nutritionFacts: [NutritionFactInput!]
    $features: [FeatureInput!]
  ) {
    updateProduct(
      id: $id
      name: $name
      description: $description
      longDescription: $longDescription
      price: $price
      discountedPrice: $discountedPrice
      discount: $discount
      image: $image
      categoryId: $categoryId
      inStock: $inStock
      sizes: $sizes
      nutritionFacts: $nutritionFacts
      features: $features
    ) {
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

export const UPDATE_PROFILE = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
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

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($oldPassword: String!, $newPassword: String!) {
    changePassword(oldPassword: $oldPassword, newPassword: $newPassword)
  }
`;

export const FORGOT_PASSWORD = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email)
  }
`;

export const RESET_PASSWORD = gql`
  mutation ResetPassword($token: String!, $newPassword: String!) {
    resetPassword(token: $token, newPassword: $newPassword)
  }
`;

export const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  } 
`

export const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $password: String!) {
    signup(name: $name, email: $email, password: $password) {
      token
      user {
        id
        name
        email
        role
      }
    }
  }
`

export const CREATE_CATEGORY = gql`
  mutation CreateCategory($input: CreateCategoryInput!) {
    createCategory(input: $input) {
      id
      name
      description
      image
    }
  }
`;

export const UPDATE_CATEGORY = gql`
  mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
    updateCategory(id: $id, input: $input) {
      id
      name
      description
      image
    }
  }
`;

export const DELETE_CATEGORY = gql`
  mutation DeleteCategory($id: ID!) {
    deleteCategory(id: $id)
  }
`;