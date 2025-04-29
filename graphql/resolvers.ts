import { PrismaClient, User, Product, Category, Order, OrderItem, ProductSize, NutritionFact, Feature, Review, Role, OrderStatus, PaymentStatus, UserStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';
import { signJwtToken, getCurrentUser } from "@/lib/auth"
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';

const prisma = new PrismaClient()
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

type Context = {
  user?: User | null
  prisma: PrismaClient
}

type ResolverParent = unknown
type ResolverArgs = Record<string, unknown>

export const resolvers = {
  DateTime: GraphQLDateTime,
  JSON: GraphQLJSON,
  Query: {
    // User queries
    me: async (_: ResolverParent, __: ResolverArgs, context: Context) => {
      const user = await getCurrentUser()
      if (!user) return null
      return prisma.user.findUnique({ where: { id: user.id } })
    },

    user: async (_: ResolverParent, { id }: { id: string }, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }
      return await context.prisma.user.findUnique({
        where: { id },
        include: {
          orders: true,
        },
      });
    },

    users: async (_: ResolverParent, { orderBy }: { orderBy?: { field: string; direction: string } }, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }
      const orderByField = orderBy?.field || 'updatedAt'
      const orderByDirection = orderBy?.direction || 'desc'
      return await context.prisma.user.findMany({
        include: {
          orders: true,
        },
        orderBy: {
          [orderByField]: orderByDirection,
        },
      });
    },

    userActivity: async (_: any, { userId }: { userId: string }, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }
      return await context.prisma.userActivity.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
    },

    // Category queries
    categories: async () => {
      return prisma.category.findMany()
    },

    category: async (_: ResolverParent, { id }: { id: string }) => {
      return prisma.category.findUnique({ where: { id } })
    },

    // Product queries
    products: async (_: ResolverParent, { orderBy }: { orderBy?: { field: string; direction: string } }) => {
      try {
        const orderByField = orderBy?.field || 'updatedAt'
        const orderByDirection = orderBy?.direction || 'desc'

        return prisma.product.findMany({
          include: {
            category: true,
            productSizes: true,
            nutritionFacts: true,
            features: true,
            reviews: true,
          },
          orderBy: {
            [orderByField]: orderByDirection,
          },
        })
      } catch (error) {
        console.error('Error in products query:', error)
        throw new Error('Failed to fetch products')
      }
    },

    product: async (_: ResolverParent, { id }: { id: string }) => {
      return prisma.product.findUnique({
        where: { id },
        include: {
          category: true,
          productSizes: true,
          nutritionFacts: true,
          features: true,
          reviews: true,
        },
      })
    },

    productsByCategory: async (_: ResolverParent, { categoryId }: { categoryId: string }) => {
      return prisma.product.findMany({
        where: { categoryId },
        include: {
          category: true,
          productSizes: true,
          nutritionFacts: true,
          features: true,
          reviews: true,
        },
      })
    },

    searchProducts: async (_: ResolverParent, { query }: { query: string }) => {
      return prisma.product.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { description: { contains: query } },
          ],
        },
        include: {
          category: true,
          productSizes: true,
          nutritionFacts: true,
          features: true,
          reviews: true,
        },
      })
    },

    // Order queries
    orders: async (_: ResolverParent, __: ResolverArgs, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return prisma.order.findMany({
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      })
    },

    order: async (_: ResolverParent, { id }: { id: string }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        throw new Error("Not authenticated")
      }

      const order = await prisma.order.findUnique({
        where: { id },
        include: {
          user: true,
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      })

      if (!order) {
        throw new Error("Order not found")
      }

      // Check if the user is the owner of the order or an admin
      if (order.userId !== currentUser.id && currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return order
    },

    myOrders: async (_: ResolverParent, __: ResolverArgs, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        throw new Error("Not authenticated")
      }

      return prisma.order.findMany({
        where: { userId: currentUser.id },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
    },
  },

  Product: {
    sizes: (parent: Product & { productSizes?: ProductSize[] }) => parent.productSizes,
  },

  Mutation: {
    // Auth mutations
    signup: async (_: ResolverParent, { name, email, password }: { name: string; email: string; password: string }) => {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser) {
        throw new Error("User with this email already exists")
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      })

      // Generate JWT token
      const token = await signJwtToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })

      return {
        token,
        user,
      }
    },

    login: async (_: ResolverParent, { email, password }: { email: string; password: string }) => {
      // Find user
      const user = await prisma.user.findUnique({ where: { email } })
      if (!user) {
        throw new Error("Invalid email or password")
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        throw new Error("Invalid email or password")
      }

      // Generate JWT token
      const token = await signJwtToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      })

      return {
        token,
        user,
      }
    },

    logout: async () => {
      // The actual logout happens on the client by removing the token
      return true
    },

    // User mutations
    updateUser: async (_: ResolverParent, { id, name, email, role }: { id: string; name?: string; email?: string; role?: Role }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return prisma.user.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(email && { email }),
          ...(role && { role }),
        },
      })
    },

    deleteUser: async (_: ResolverParent, { id }: { id: string }, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      const user = await context.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'ADMIN') {
        throw new Error('Cannot delete admin user');
      }

      await context.prisma.user.delete({ where: { id } });
      return true;
    },

    // Category mutations
    createCategory: async (_: ResolverParent, { name, description }: { name: string; description: string }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return prisma.category.create({
        data: {
          name,
          description,
        },
      })
    },

    updateCategory: async (_: ResolverParent, { id, name, description }: { id: string; name?: string; description?: string }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return prisma.category.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(description && { description }),
        },
      })
    },

    deleteCategory: async (_: ResolverParent, { id }: { id: string }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      await prisma.category.delete({ where: { id } })
      return true
    },

    // Product mutations
    createProduct: async (
      _: ResolverParent,
      {
        name,
        description,
        longDescription,
        price,
        discountedPrice,
        discount,
        image,
        categoryId,
        inStock,
        sizes,
        nutritionFacts,
        features,
      }: {
        name: string
        description: string
        longDescription?: string
        price: number
        discountedPrice?: number
        discount?: number
        image: string
        categoryId: string
        inStock: boolean
        sizes?: Array<{ value: string; label: string; price: number }>
        nutritionFacts?: Array<{ name: string; value: string }>
        features?: Array<{ text: string }>
      },
      context: Context,
    ) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return prisma.product.create({
        data: {
          name,
          description,
          longDescription,
          price,
          discountedPrice,
          discount,
          image,
          categoryId,
          inStock,
          ...(sizes && {
            productSizes: {
              createMany: {
                data: sizes,
              },
            },
          }),
          ...(nutritionFacts && {
            nutritionFacts: {
              createMany: {
                data: nutritionFacts,
              },
            },
          }),
          ...(features && {
            features: {
              createMany: {
                data: features,
              },
            },
          }),
        },
        include: {
          category: true,
          productSizes: true,
          nutritionFacts: true,
          features: true,
          reviews: true,
        },
      })
    },

    updateProduct: async (
      _: ResolverParent,
      {
        id,
        name,
        description,
        longDescription,
        price,
        discountedPrice,
        discount,
        image,
        categoryId,
        inStock,
        sizes,
        nutritionFacts,
        features,
      }: {
        id: string
        name?: string
        description?: string
        longDescription?: string
        price?: number
        discountedPrice?: number
        discount?: number
        image?: string
        categoryId?: string
        inStock?: boolean
        sizes?: Array<{ value: string; label: string; price: number }>
        nutritionFacts?: Array<{ name: string; value: string }>
        features?: Array<{ text: string }>
      },
      context: Context,
    ) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      // Start a transaction to handle related data
      return prisma.$transaction(async (tx) => {
        // Update the product
        const product = await tx.product.update({
          where: { id },
          data: {
            ...(name && { name }),
            ...(description && { description }),
            ...(longDescription !== undefined && { longDescription }),
            ...(price !== undefined && { price }),
            ...(discountedPrice !== undefined && { discountedPrice }),
            ...(discount !== undefined && { discount }),
            ...(image && { image }),
            ...(categoryId && { categoryId }),
            ...(inStock !== undefined && { inStock }),
          },
        })

        // Update sizes if provided
        if (sizes) {
          // Delete existing sizes
          await tx.productSize.deleteMany({
            where: { productId: id },
          })

          // Create new sizes
          await tx.productSize.createMany({
            data: sizes.map((size) => ({
              ...size,
              productId: id,
            })),
          })
        }

        // Update nutrition facts if provided
        if (nutritionFacts) {
          // Delete existing nutrition facts
          await tx.nutritionFact.deleteMany({
            where: { productId: id },
          })

          // Create new nutrition facts
          await tx.nutritionFact.createMany({
            data: nutritionFacts.map((fact) => ({
              ...fact,
              productId: id,
            })),
          })
        }

        // Update features if provided
        if (features) {
          // Delete existing features
          await tx.feature.deleteMany({
            where: { productId: id },
          })

          // Create new features
          await tx.feature.createMany({
            data: features.map((feature) => ({
              ...feature,
              productId: id,
            })),
          })
        }

        // Return the updated product with all relations
        return tx.product.findUnique({
          where: { id },
          include: {
            category: true,
            productSizes: true,
            nutritionFacts: true,
            features: true,
            reviews: true,
          },
        })
      })
    },

    deleteProduct: async (_: ResolverParent, { id }: { id: string }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      await prisma.product.delete({ where: { id } })
      return true
    },

    // Review mutations
    addReview: async (_: ResolverParent, { productId, name, rating, comment }: { productId: string; name: string; rating: number; comment: string }) => {
      return prisma.review.create({
        data: {
          name,
          rating,
          comment,
          productId,
        },
      })
    },

    // Order mutations
    createOrder: async (
      _: ResolverParent,
      {
        orderItems,
        shippingAddress,
        paymentMethod,
        totalAmount,
        shippingFee,
      }: {
        orderItems: Array<{ productId: string; quantity: number; price: number; size?: string }>
        shippingAddress: { fullName: string; address: string; city: string; state: string; postalCode: string; phone: string }
        paymentMethod: string
        totalAmount: number
        shippingFee: number
      },
      context: Context,
    ) => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        throw new Error("Not authenticated")
      }

      return prisma.$transaction(async (tx) => {
        // Create the order
        const order = await tx.order.create({
          data: {
            userId: currentUser.id,
            shippingAddress,
            paymentMethod,
            totalAmount,
            shippingFee,
            status: "PENDING",
            paymentStatus: "PENDING",
          },
        })

        // Create order items
        await tx.orderItem.createMany({
          data: orderItems.map((item) => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
          })),
        })

        // Return the created order with items
        return tx.order.findUnique({
          where: { id: order.id },
          include: {
            orderItems: {
              include: {
                product: true,
              },
            },
          },
        })
      })
    },

    updateOrderStatus: async (_: ResolverParent, { id, status }: { id: string; status: OrderStatus }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return prisma.order.update({
        where: { id },
        data: { status },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      })
    },

    updatePaymentStatus: async (_: ResolverParent, { id, status }: { id: string; status: PaymentStatus }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized")
      }

      return prisma.order.update({
        where: { id },
        data: { paymentStatus: status },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      })
    },

    updateUserStatus: async (_: any, { id, status }: { id: string; status: string }, context: Context) => {
      if (!context.user || context.user.role !== 'ADMIN') {
        throw new Error('Unauthorized');
      }

      const user = await context.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === 'ADMIN') {
        throw new Error('Cannot modify admin user status');
      }

      return await context.prisma.user.update({
        where: { id },
        data: { status: status as UserStatus },
      });
    },

    recordUserActivity: async (_: any, { userId, type, details }: { userId: string; type: string; details: any }, context: Context) => {
      const user = await context.prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        throw new Error('User not found');
      }

      // Update last activity timestamp
      await context.prisma.user.update({
        where: { id: userId },
        data: { lastActivityAt: new Date() },
      });

      return await context.prisma.userActivity.create({
        data: {
          userId,
          type,
          details,
        },
      });
    },

    addUser: async (_: ResolverParent, { name, email, isAdmin }: { name: string; email: string; isAdmin: boolean }, context: Context) => {
      const currentUser = await getCurrentUser();
      const saltRounds = 10;
      if (!currentUser || currentUser.role !== "ADMIN") {
        throw new Error("Not authorized");
      }
    
      const temporaryPassword = uuidv4().substring(0, 12);
      const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);
    
      const newUser = await prisma.user.create({
        data: { name, email, role: isAdmin ? "ADMIN" : "USER", password: hashedPassword },
      });
    
      const msg = {
        to: newUser.email,
        from: process.env.EMAIL_FROM!, // Your verified sender email address
        subject: 'Your New Account Information',
        html: `
          <p>Hello ${newUser.name},</p>
          <p>An administrator has created a new account for you on our platform.</p>
          <p>Your temporary password is: <strong>${temporaryPassword}</strong></p>
          <p>Please log in with this password and immediately change it to a password of your choice.</p>
          <p><a href="${process.env.FRONTEND_URL}/login">Click here to log in</a></p>
          <p>Thank you,</p>
          <p>The Team</p>
        `,
      };
    
      try {
        await sgMail.send(msg);
        console.log(`Email sent to ${newUser.email}`);
      } catch (error: any) {
        console.log(process.env.SENDGRID_API_KEY)
        console.log(process.env.EMAIL_FROM)
        console.log(msg)
        console.error('SendGrid error:', JSON.stringify(error, null, 2));

        // You might want to handle this error gracefully (e.g., log it, inform the admin)
      }
    
      return newUser;
    },
  },

  User: {
    status: (user: any) => {
      if (user.status === 'DEACTIVATED') return 'DEACTIVATED';
      
      const now = new Date();
      const lastActivity = user.lastActivityAt ? new Date(user.lastActivityAt) : null;
      
      if (!lastActivity) return 'INACTIVE';
      
      const daysSinceLastActivity = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceLastActivity <= 30 ? 'ACTIVE' : 'INACTIVE';
    },
  },
}
