import { PrismaClient, Role, UserStatus } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@shreemahakali.com' },
    update: {},
    create: {
      email: 'admin@shreemahakali.com',
      name: 'Admin User',
      password: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      phoneNumber: '+919876543210',
      address: {
        create: {
          street: '123 Admin Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          zipCode: '400001'
        }
      }
    },
  })

  // Create regular user
  const userPassword = await bcrypt.hash('User@123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      name: 'Regular User',
      password: userPassword,
      role: Role.USER,
      status: UserStatus.ACTIVE,
      phoneNumber: '+919876543211',
      address: {
        create: {
          street: '456 User Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          zipCode: '400002'
        }
      }
    },
  })

  // Create categories
  const dairyCategory = await prisma.category.create({
    data: {
      name: 'Dairy Products',
      description: 'Fresh dairy products including milk, curd, and paneer'
    }
  })

  const sweetsCategory = await prisma.category.create({
    data: {
      name: 'Sweets',
      description: 'Traditional Indian sweets and desserts'
    }
  })

  const namkeenCategory = await prisma.category.create({
    data: {
      name: 'Namkeen',
      description: 'Crispy and savory snacks'
    }
  })

  // Create sample products
  const products = await Promise.all([
    // Dairy Products
    prisma.product.create({
      data: {
        name: 'Fresh Cow Milk',
        description: 'Pure and fresh cow milk',
        longDescription: 'Our premium quality cow milk is collected fresh from local farms and processed with utmost care to maintain its natural goodness.',
        price: 60.00,
        image: 'https://res.cloudinary.com/diuck2bob/image/upload/v1709123456/products/milk.jpg',
        categoryId: dairyCategory.id,
        inStock: true,
        features: {
          create: [
            { text: 'Pure and Natural' },
            { text: 'Rich in Calcium' },
            { text: 'No Preservatives' }
          ]
        },
        nutritionFacts: {
          create: [
            { name: 'Calories', value: '66 kcal' },
            { name: 'Protein', value: '3.2g' },
            { name: 'Fat', value: '3.6g' }
          ]
        },
        productSizes: {
          create: [
            { value: '500ml', label: '500ml', price: 30.00 },
            { value: '1L', label: '1 Liter', price: 60.00 }
          ]
        }
      }
    }),
    // Sweets
    prisma.product.create({
      data: {
        name: 'Gulab Jamun',
        description: 'Traditional Indian sweet',
        longDescription: 'Soft and spongy milk-solid balls soaked in rose-flavored sugar syrup.',
        price: 400.00,
        discountedPrice: 350.00,
        discount: 12,
        image: 'https://res.cloudinary.com/diuck2bob/image/upload/v1709123456/products/gulab-jamun.jpg',
        categoryId: sweetsCategory.id,
        inStock: true,
        features: {
          create: [
            { text: 'Made with Pure Khoya' },
            { text: 'Traditional Recipe' },
            { text: 'Rich in Taste' }
          ]
        },
        productSizes: {
          create: [
            { value: '250g', label: '250g Box', price: 350.00 },
            { value: '500g', label: '500g Box', price: 650.00 }
          ]
        }
      }
    }),
    // Namkeen
    prisma.product.create({
      data: {
        name: 'Mixed Namkeen',
        description: 'Assorted savory snacks',
        longDescription: 'A perfect blend of various crispy and savory snacks including sev, peanuts, and more.',
        price: 200.00,
        image: 'https://res.cloudinary.com/diuck2bob/image/upload/v1709123456/products/namkeen.jpg',
        categoryId: namkeenCategory.id,
        inStock: true,
        features: {
          create: [
            { text: 'Fresh and Crispy' },
            { text: 'Perfect Blend' },
            { text: 'Great for Snacking' }
          ]
        },
        productSizes: {
          create: [
            { value: '250g', label: '250g Pack', price: 200.00 },
            { value: '500g', label: '500g Pack', price: 380.00 }
          ]
        }
      }
    })
  ])

  console.log('Database has been seeded. 🌱')
  console.log('Admin user created:', admin.email)
  console.log('Regular user created:', user.email)
  console.log('Categories created:', [dairyCategory.name, sweetsCategory.name, namkeenCategory.name])
  console.log('Products created:', products.map(p => p.name))
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
