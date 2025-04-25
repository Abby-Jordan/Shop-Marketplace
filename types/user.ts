import { Product } from "./product";

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE' | 'PENDING'; // Example of a string enum
  lastLoginAt?: Date | null; // Optional and nullable
  lastActivityAt?: Date | null; // Optional and nullable
  createdAt: Date;
  updatedAt: Date;
  orders: Order[]; // Assuming you have an Order interface
}

// You would also need to define the Order interface:
export interface Order {
  createdAt: string; // Assuming you want to keep it as a string
  id: string;
  orderItems: OrderItem[]; // Assuming you have an OrderItem interface
  paymentMethod: string;
  paymentStatus: PaymentStatus; // Assuming you have a PaymentStatus enum or interface
  shippingAddress: ShippingAddress; // Assuming you have a ShippingAddress interface
  shippingFee: number;
  status: OrderStatus; // Assuming you have an OrderStatus enum or interface
  totalAmount: number;
  updatedAt: string; // Assuming you want to keep it as a string
  user?: User; // Making this optional as per your GraphQL schema
  userId: string;
}

export enum OrderStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export interface ShippingAddress {
  address: string;
  city: string;
  fullName: string;
  phone: string;
  postalCode: string;
  state: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface OrderItem {
  id: string;
  price: number;
  product?: Product; // Assuming you have a Product interface
  productId: string;
  quantity: number;
  size?: string;
}