import { PrismaClient, User, Product, Category, Order, OrderItem, ProductSize, NutritionFact, Feature, Review, Role, OrderStatus, PaymentStatus, UserStatus } from "@prisma/client"
import bcrypt from "bcryptjs"
import { GraphQLDateTime, GraphQLJSON } from 'graphql-scalars';
import { signJwtToken, getCurrentUser } from "@/lib/auth"
import { v4 as uuidv4 } from 'uuid';
import sgMail from '@sendgrid/mail';
import { addMinutes } from 'date-fns';
import { requireAdmin, canAccessUser } from "./permissions";
import { Role as GraphQLRole } from "./graphql-types"

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
      return prisma.user.findUnique({
        where: { id: user.id },
        include: { address: true },
      })
    },

    user: async (_: ResolverParent, { id }: { id: string }, context: Context) => {
      canAccessUser(context.user, id);
      return prisma.user.findUnique({
        where: { id },
        include: {
          orders: true,
        },
      });
    },

    users: async (_: ResolverParent, { orderBy, where }: { orderBy?: { field: string; direction: string }, where?: any }, context: Context) => {
      requireAdmin(context.user);
      const orderByField = orderBy?.field || 'updatedAt'
      const orderByDirection = orderBy?.direction || 'desc'
      return await context.prisma.user.findMany({
        where: where || {},
        include: {
          orders: true,
        },
        orderBy: {
          [orderByField]: orderByDirection,
        },
      });
    },

    userCount: async (_: any, { where }: { where?: any }, context: Context) => {
      requireAdmin(context.user);
      return await context.prisma.user.count({
        where: where || {},
      });
    },

    userActivity: async (_: any, { userId }: { userId: string }, context: Context) => {
      requireAdmin(context.user);
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

    productCount: async (_: ResolverParent, __: ResolverArgs, context: Context) => {
      requireAdmin(context.user);
      return await context.prisma.product.count();
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
    orders: async (_: ResolverParent, args: { take?: number, orderBy?: { createdAt?: "asc" | "desc" } }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
        throw new Error("Not authorized")
      }
    
      const { take , orderBy} = args
    
      return prisma.order.findMany({
        take,
        orderBy: orderBy || { createdAt: "desc" },
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

    orderCount: async (_: any, { where }: { where?: any }, context: Context) => {
      requireAdmin(context.user);
      return await context.prisma.order.count({
        where: where || {},
      });
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
      if (order.userId !== currentUser.id && currentUser.role !== GraphQLRole.Admin) {
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

      // Check if user is deactivated
      if (user.status === 'DEACTIVATED') {
        throw new Error("Your account is deactivated. Please contact admin.")
      }

      // Verify password
      const validPassword = await bcrypt.compare(password, user.password)
      if (!validPassword) {
        throw new Error("Invalid email or password")
      }

      // Update lastLogin and lastActivityAt
      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          lastActivityAt: new Date(),
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

    logout: async (_: ResolverParent, __: ResolverArgs, context: Context) => {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        await prisma.user.update({
          where: { id: currentUser.id },
          data: { lastActivityAt: new Date() },
        });
      }
      // The actual logout happens on the client by removing the token
      return true;
    },

    // User mutations
    updateUser: async (_: ResolverParent, { id, name, email, role }: { id: string; name?: string; email?: string; role?: Role }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
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
      if (!context.user || context.user.role !== GraphQLRole.Admin) {
        throw new Error('Unauthorized');
      }
    
      const user = await context.prisma.user.findUnique({ where: { id }, include: { orders: true } });
      if (!user) {
        throw new Error('User not found');
      }
    
      if (user.role === GraphQLRole.Admin) {
        throw new Error('Cannot delete admin user');
      }

      const hasIncompleteOrders = user.orders.some(
        (order: Order) => order.status !== OrderStatus.DELIVERED && order.status !== OrderStatus.CANCELLED
      );
    
      if (hasIncompleteOrders) {
        throw new Error('Cannot delete user with pending or uncompleted orders.');
      }
    
      // Delete address first (if exists)
      await context.prisma.address.deleteMany({ where: { userId: id } });
    
      await context.prisma.user.delete({ where: { id } });
      return true;
    },

    updateProfile: async (_: ResolverParent, { input }: { input: any }, context: Context) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error('Not authenticated');
      }

      const updateUserData: any = {};

      if (input.name) updateUserData.name = input.name;
      if (input.phoneNumber) updateUserData.phoneNumber = input.phoneNumber;
      if (input.bio) updateUserData.bio = input.bio;
      if (input.profileImage) updateUserData.profileImage = input.profileImage;
      if (input.preferences) updateUserData.preferences = input.preferences;

      // 🌟 Handle address update or create
      if (input.address) {
        const existingAddress = await context.prisma.address.findUnique({
          where: {
            userId: currentUser.id,
          },
        });

        if (existingAddress) {
          await context.prisma.address.update({
            where: {
              userId: currentUser.id,
            },
            data: {
              street: input.address.street,
              city: input.address.city,
              state: input.address.state,
              country: input.address.country,
              zipCode: input.address.zipCode,
            },
          });
        } else {
          await context.prisma.address.create({
            data: {
              id: uuidv4(), // Generate new UUID
              userId: currentUser.id,
              street: input.address.street,
              city: input.address.city,
              state: input.address.state,
              country: input.address.country,
              zipCode: input.address.zipCode,
            },
          });
        }
      }

      // 🌟 Update user profile
      const updatedUser = await context.prisma.user.update({
        where: { id: currentUser.id },
        data: updateUserData,
        include: {
          address: true, // Include the address automatically!
        },
      });

      // 🌟 Return nicely formatted data
      return {
        ...updatedUser,
        address: updatedUser.address ? {
          street: updatedUser.address.street,
          city: updatedUser.address.city,
          state: updatedUser.address.state,
          country: updatedUser.address.country,
          zipCode: updatedUser.address.zipCode,
        } : null,
      };
    },

    // updateProfile: async (_: ResolverParent, { input }: { input: any }, context: Context) => {
    //   const currentUser = await getCurrentUser();
    //   if (!currentUser) {
    //     throw new Error('Not authenticated');
    //   }

    //   const updateData: any = {};

    //   if (input.name) updateData.name = input.name;
    //   if (input.phoneNumber) updateData.phoneNumber = input.phoneNumber;
    //   if (input.bio) updateData.bio = input.bio;
    //   if (input.profileImage) updateData.profileImage = input.profileImage;
    //   if (input.preferences) updateData.preferences = input.preferences;

    //   if (input.address) {
    //     // Check if user already has an address
    //     const existingAddress = await context.prisma.$queryRaw<Array<{ id: string }>>`
    //       SELECT id FROM addresses WHERE "userId" = ${currentUser.id}
    //     `;

    //     if (existingAddress && existingAddress.length > 0) {
    //       // Update existing address
    //       await context.prisma.$executeRaw`
    //         UPDATE addresses 
    //         SET street = ${input.address.street},
    //             city = ${input.address.city},
    //             state = ${input.address.state},
    //             country = ${input.address.country},
    //             zip_code = ${input.address.zipCode}
    //         WHERE "userId" = ${currentUser.id}
    //       `;
    //     } else {
    //       // Create new address
    //       await context.prisma.$executeRaw`
    //         INSERT INTO "addresses" (id, street, city, state, country, zip_code, "userId", created_at, updated_at)
    //         VALUES (gen_random_uuid(), ${input.address.street}, ${input.address.city}, ${input.address.state}, ${input.address.country}, ${input.address.zipCode}, ${currentUser.id}, NOW(), NOW())
    //       `;
    //     }
    //   }

    //   const updatedUser = await context.prisma.user.update({
    //     where: { id: currentUser.id },
    //     data: updateData,
    //   });

    //   // Fetch the address separately
    //   const address = await context.prisma.$queryRaw<Array<{
    //     id: string;
    //     street: string;
    //     city: string;
    //     state: string;
    //     country: string;
    //     zip_code: string;
    //   }>>`
    //     SELECT * FROM addresses WHERE userId = ${currentUser.id}
    //   `;

    //   return {
    //     ...updatedUser,
    //     address: address && address.length > 0 ? {
    //       street: address[0].street,
    //       city: address[0].city,
    //       state: address[0].state,
    //       country: address[0].country,
    //       zipCode: address[0].zip_code
    //     } : null
    //   };
    // },

    // Category mutations
    createCategory: async (_: ResolverParent, { name, description }: { name: string; description: string }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
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
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
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
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
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
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
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
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
        throw new Error("Not authorized")
      }

      // Start a transaction with increased timeout
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

        // Handle related data updates in parallel
        const updatePromises = []

        if (sizes) {
          updatePromises.push(
            tx.productSize.deleteMany({ where: { productId: id } }),
            tx.productSize.createMany({
              data: sizes.map((size) => ({
                ...size,
                productId: id,
              })),
            })
          )
        }

        if (nutritionFacts) {
          updatePromises.push(
            tx.nutritionFact.deleteMany({ where: { productId: id } }),
            tx.nutritionFact.createMany({
              data: nutritionFacts.map((fact) => ({
                ...fact,
                productId: id,
              })),
            })
          )
        }

        if (features) {
          updatePromises.push(
            tx.feature.deleteMany({ where: { productId: id } }),
            tx.feature.createMany({
              data: features.map((feature) => ({
                ...feature,
                productId: id,
              })),
            })
          )
        }

        // Execute all updates in parallel
        await Promise.all(updatePromises)

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
      }, {
        timeout: 10000 // Increase timeout to 10 seconds
      })
    },

    deleteProduct: async (_: ResolverParent, { id }: { id: string }, context: Context) => {
      const currentUser = await getCurrentUser()
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
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
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
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
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
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
      if (!context.user || context.user.role !== GraphQLRole.Admin) {
        throw new Error('Unauthorized');
      }

      const user = await context.prisma.user.findUnique({ where: { id } });
      if (!user) {
        throw new Error('User not found');
      }

      if (user.role === GraphQLRole.Admin) {
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
      if (!currentUser || currentUser.role !== GraphQLRole.Admin) {
        throw new Error("Not authorized");
      }

      const temporaryPassword = uuidv4().substring(0, 12);
      const hashedPassword = await bcrypt.hash(temporaryPassword, saltRounds);

      const newUser = await prisma.user.create({
        data: { name, email, role: isAdmin ? GraphQLRole.Admin : GraphQLRole.User, password: hashedPassword },
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
          <p><a href="${process.env.FRONTEND_URL}/auth">Click here to log in</a></p>
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

    changePassword: async (_: ResolverParent, { oldPassword, newPassword }: { oldPassword: string; newPassword: string }, context: Context) => {
      const currentUser = await getCurrentUser();
      if (!currentUser) {
        throw new Error("Not authenticated");
      }

      const user = await prisma.user.findUnique({ where: { id: currentUser.id } });
      if (!user) {
        throw new Error("User not found");
      }

      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      const isPasswordSame = await bcrypt.compare(newPassword, user.password);
      if (!isPasswordValid) {
        throw new Error("Invalid old password");
      }

      if (isPasswordSame) {
        throw new Error("New password cannot be the same as the old password");
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { password: hashedNewPassword },
      });

      return true;

    },

    forgotPassword: async (_: ResolverParent, { email }: { email: string }, context: Context) => {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        throw new Error("User not found");
      }
    
      const token = uuidv4();
      const expires = addMinutes(new Date(), 60); // 1 hour expiry
    
      await prisma.user.update({
        where: { email },
        data: {
          passwordResetToken: token,
          passwordResetExpires: expires,
        },
      });
    
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
      const msg = {
        to: user.email,
        from: process.env.EMAIL_FROM!,
        subject: 'Password Reset Request',
        html: `
          <p>Hello ${user.name},</p>
          <p>We received a request to reset your password. Click the link below:</p>
          <p><a href="${resetUrl}">Reset your password</a></p>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, you can ignore this email.</p>
          <p>Thanks,<br/>The Team</p>
        `,
      };
    
      try {
        await sgMail.send(msg);
        console.log(`Reset email sent to ${user.email}`);
      } catch (error: any) {
        console.error('SendGrid error:', error);
        throw new Error("Failed to send reset email");
      }
    
      return true;
    },

    resetPassword: async (_: ResolverParent, { token, newPassword }: { token: string, newPassword: string }, context: Context) => {
      const user = await prisma.user.findFirst({
        where: {
          passwordResetToken: token,
          passwordResetExpires: { gt: new Date() },
        },
      });
    
      if (!user) {
        throw new Error("Invalid or expired token");
      }
    
      const hashed = await bcrypt.hash(newPassword, 10);
    
      await prisma.user.update({
        where: { id: user.id },
        data: {
          password: hashed,
          passwordResetToken: null,
          passwordResetExpires: null,
        },
      });
      
      return true;
    }
    
    
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
