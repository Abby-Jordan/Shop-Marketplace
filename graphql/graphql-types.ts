export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
  JSON: { input: any; output: any; }
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  country: Scalars['String']['output'];
  state: Scalars['String']['output'];
  street: Scalars['String']['output'];
  zipCode: Scalars['String']['output'];
};

export type AddressInput = {
  city?: InputMaybe<Scalars['String']['input']>;
  country?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  street?: InputMaybe<Scalars['String']['input']>;
  zipCode?: InputMaybe<Scalars['String']['input']>;
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  token: Scalars['String']['output'];
  user: User;
};

export type Category = {
  __typename?: 'Category';
  createdAt: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  products?: Maybe<Array<Product>>;
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateCategoryInput = {
  description: Scalars['String']['input'];
  image?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
};

export type Feature = {
  __typename?: 'Feature';
  id: Scalars['ID']['output'];
  text: Scalars['String']['output'];
};

export type FeatureInput = {
  text: Scalars['String']['input'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addReview: Review;
  addUser: User;
  changePassword: Scalars['Boolean']['output'];
  createCategory: Category;
  createOrder: Order;
  createProduct: Product;
  deleteCategory: Scalars['Boolean']['output'];
  deleteProduct: Scalars['Boolean']['output'];
  deleteUser: Scalars['Boolean']['output'];
  forgotPassword: Scalars['Boolean']['output'];
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  recordUserActivity: UserActivity;
  resetPassword: Scalars['Boolean']['output'];
  signup: AuthPayload;
  updateCategory: Category;
  updateOrderStatus: Order;
  updatePaymentStatus: Order;
  updateProduct: Product;
  updateProfile: User;
  updateUser: User;
  updateUserStatus: User;
};


export type MutationAddReviewArgs = {
  comment: Scalars['String']['input'];
  name: Scalars['String']['input'];
  productId: Scalars['ID']['input'];
  rating: Scalars['Int']['input'];
};


export type MutationAddUserArgs = {
  email: Scalars['String']['input'];
  isAdmin: Scalars['Boolean']['input'];
  name: Scalars['String']['input'];
};


export type MutationChangePasswordArgs = {
  newPassword: Scalars['String']['input'];
  oldPassword: Scalars['String']['input'];
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreateOrderArgs = {
  orderItems: Array<OrderItemInput>;
  paymentMethod: Scalars['String']['input'];
  shippingAddress: ShippingAddressInput;
  shippingFee: Scalars['Float']['input'];
  totalAmount: Scalars['Float']['input'];
};


export type MutationCreateProductArgs = {
  categoryId: Scalars['ID']['input'];
  description: Scalars['String']['input'];
  discount?: InputMaybe<Scalars['Int']['input']>;
  discountedPrice?: InputMaybe<Scalars['Float']['input']>;
  features?: InputMaybe<Array<FeatureInput>>;
  image: Scalars['String']['input'];
  inStock: Scalars['Boolean']['input'];
  longDescription?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  nutritionFacts?: InputMaybe<Array<NutritionFactInput>>;
  price: Scalars['Float']['input'];
  sizes?: InputMaybe<Array<ProductSizeInput>>;
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteProductArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDeleteUserArgs = {
  id: Scalars['ID']['input'];
};


export type MutationForgotPasswordArgs = {
  email: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRecordUserActivityArgs = {
  details?: InputMaybe<Scalars['JSON']['input']>;
  type: Scalars['String']['input'];
  userId: Scalars['ID']['input'];
};


export type MutationResetPasswordArgs = {
  newPassword: Scalars['String']['input'];
  token: Scalars['String']['input'];
};


export type MutationSignupArgs = {
  email: Scalars['String']['input'];
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationUpdateCategoryArgs = {
  id: Scalars['ID']['input'];
  input: UpdateCategoryInput;
};


export type MutationUpdateOrderStatusArgs = {
  id: Scalars['ID']['input'];
  status: OrderStatus;
};


export type MutationUpdatePaymentStatusArgs = {
  id: Scalars['ID']['input'];
  status: PaymentStatus;
};


export type MutationUpdateProductArgs = {
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  discount?: InputMaybe<Scalars['Int']['input']>;
  discountedPrice?: InputMaybe<Scalars['Float']['input']>;
  features?: InputMaybe<Array<FeatureInput>>;
  id: Scalars['ID']['input'];
  image?: InputMaybe<Scalars['String']['input']>;
  inStock?: InputMaybe<Scalars['Boolean']['input']>;
  longDescription?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  nutritionFacts?: InputMaybe<Array<NutritionFactInput>>;
  price?: InputMaybe<Scalars['Float']['input']>;
  sizes?: InputMaybe<Array<ProductSizeInput>>;
};


export type MutationUpdateProfileArgs = {
  input: UpdateProfileInput;
};


export type MutationUpdateUserArgs = {
  email?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
  name?: InputMaybe<Scalars['String']['input']>;
  role?: InputMaybe<Role>;
};


export type MutationUpdateUserStatusArgs = {
  id: Scalars['ID']['input'];
  status: UserStatus;
};

export type NutritionFact = {
  __typename?: 'NutritionFact';
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type NutritionFactInput = {
  name: Scalars['String']['input'];
  value: Scalars['String']['input'];
};

export type Order = {
  __typename?: 'Order';
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  orderItems: Array<OrderItem>;
  paymentMethod: Scalars['String']['output'];
  paymentStatus: PaymentStatus;
  shippingAddress: ShippingAddress;
  shippingFee: Scalars['Float']['output'];
  status: OrderStatus;
  totalAmount: Scalars['Float']['output'];
  updatedAt: Scalars['String']['output'];
  user?: Maybe<User>;
  userId: Scalars['ID']['output'];
};

export type OrderItem = {
  __typename?: 'OrderItem';
  id: Scalars['ID']['output'];
  price: Scalars['Float']['output'];
  product?: Maybe<Product>;
  productId: Scalars['ID']['output'];
  quantity: Scalars['Int']['output'];
  size?: Maybe<Scalars['String']['output']>;
};

export type OrderItemInput = {
  price: Scalars['Float']['input'];
  productId: Scalars['ID']['input'];
  quantity: Scalars['Int']['input'];
  size?: InputMaybe<Scalars['String']['input']>;
};

export type OrderOrderByInput = {
  createdAt?: InputMaybe<SortDirection>;
};

export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Delivered = 'DELIVERED',
  Pending = 'PENDING',
  Processing = 'PROCESSING',
  Shipped = 'SHIPPED'
}

export type OrderWhereInput = {
  status?: InputMaybe<OrderStatus>;
};

export enum PaymentStatus {
  Failed = 'FAILED',
  Paid = 'PAID',
  Pending = 'PENDING',
  Refunded = 'REFUNDED'
}

export type Product = {
  __typename?: 'Product';
  category?: Maybe<Category>;
  categoryId: Scalars['ID']['output'];
  createdAt: Scalars['String']['output'];
  description: Scalars['String']['output'];
  discount?: Maybe<Scalars['Int']['output']>;
  discountedPrice?: Maybe<Scalars['Float']['output']>;
  features?: Maybe<Array<Feature>>;
  id: Scalars['ID']['output'];
  image: Scalars['String']['output'];
  inStock: Scalars['Boolean']['output'];
  longDescription?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  nutritionFacts?: Maybe<Array<NutritionFact>>;
  price: Scalars['Float']['output'];
  reviews?: Maybe<Array<Review>>;
  sizes?: Maybe<Array<ProductSize>>;
  updatedAt: Scalars['String']['output'];
};

export type ProductOrderByInput = {
  direction: Scalars['String']['input'];
  field: Scalars['String']['input'];
};

export type ProductSize = {
  __typename?: 'ProductSize';
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  price: Scalars['Float']['output'];
  value: Scalars['String']['output'];
};

export type ProductSizeInput = {
  label: Scalars['String']['input'];
  price: Scalars['Float']['input'];
  value: Scalars['String']['input'];
};

export type Query = {
  __typename?: 'Query';
  categories: Array<Category>;
  category?: Maybe<Category>;
  me?: Maybe<User>;
  myOrders: Array<Order>;
  order?: Maybe<Order>;
  orderCount: Scalars['Int']['output'];
  orders: Array<Order>;
  product?: Maybe<Product>;
  productCount: Scalars['Int']['output'];
  products: Array<Product>;
  productsByCategory: Array<Product>;
  searchProducts: Array<Product>;
  user?: Maybe<User>;
  userActivity: Array<UserActivity>;
  userCount: Scalars['Int']['output'];
  users: Array<User>;
};


export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderArgs = {
  id: Scalars['ID']['input'];
};


export type QueryOrderCountArgs = {
  where?: InputMaybe<OrderWhereInput>;
};


export type QueryOrdersArgs = {
  orderBy?: InputMaybe<OrderOrderByInput>;
  take?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductArgs = {
  id: Scalars['ID']['input'];
};


export type QueryProductsArgs = {
  orderBy?: InputMaybe<ProductOrderByInput>;
};


export type QueryProductsByCategoryArgs = {
  categoryId: Scalars['ID']['input'];
};


export type QuerySearchProductsArgs = {
  query: Scalars['String']['input'];
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserActivityArgs = {
  userId: Scalars['ID']['input'];
};


export type QueryUserCountArgs = {
  where?: InputMaybe<UserWhereInput>;
};


export type QueryUsersArgs = {
  orderBy?: InputMaybe<UserOrderByInput>;
  where?: InputMaybe<UserWhereInput>;
};

export type Review = {
  __typename?: 'Review';
  comment: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  rating: Scalars['Int']['output'];
};

export enum Role {
  Admin = 'ADMIN',
  User = 'USER'
}

export type ShippingAddress = {
  __typename?: 'ShippingAddress';
  address: Scalars['String']['output'];
  city: Scalars['String']['output'];
  fullName: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  postalCode: Scalars['String']['output'];
  state: Scalars['String']['output'];
};

export type ShippingAddressInput = {
  address: Scalars['String']['input'];
  city: Scalars['String']['input'];
  fullName: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  postalCode: Scalars['String']['input'];
  state: Scalars['String']['input'];
};

export enum SortDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type UpdateCategoryInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateProfileInput = {
  address?: InputMaybe<AddressInput>;
  bio?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  phoneNumber?: InputMaybe<Scalars['String']['input']>;
  preferences?: InputMaybe<Scalars['JSON']['input']>;
  profileImage?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  address?: Maybe<Address>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  lastActivityAt?: Maybe<Scalars['DateTime']['output']>;
  lastLoginAt?: Maybe<Scalars['DateTime']['output']>;
  name: Scalars['String']['output'];
  orders: Array<Order>;
  phoneNumber?: Maybe<Scalars['String']['output']>;
  preferences?: Maybe<Scalars['JSON']['output']>;
  profileImage?: Maybe<Scalars['String']['output']>;
  role: Role;
  status: UserStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export type UserActivity = {
  __typename?: 'UserActivity';
  createdAt: Scalars['DateTime']['output'];
  details?: Maybe<Scalars['JSON']['output']>;
  id: Scalars['ID']['output'];
  type: Scalars['String']['output'];
  userId: Scalars['ID']['output'];
};

export type UserOrderByInput = {
  direction: Scalars['String']['input'];
  field: Scalars['String']['input'];
};

export enum UserStatus {
  Active = 'ACTIVE',
  Deactivated = 'DEACTIVATED',
  Inactive = 'INACTIVE'
}

export type UserWhereInput = {
  status?: InputMaybe<UserStatus>;
};
