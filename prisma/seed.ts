// import { PrismaClient } from "@prisma/client"
// import * as bcrypt from "bcryptjs"

// const prisma = new PrismaClient()

// async function main() {
//   // Clean up existing data
//   await prisma.orderItem.deleteMany({})
//   await prisma.order.deleteMany({})
//   await prisma.review.deleteMany({})
//   await prisma.feature.deleteMany({})
//   await prisma.nutritionFact.deleteMany({})
//   await prisma.productSize.deleteMany({})
//   await prisma.product.deleteMany({})
//   await prisma.category.deleteMany({})
//   await prisma.user.deleteMany({})

//   // Create admin user
//   const adminPassword = await bcrypt.hash("admin123", 10)
//   const admin = await prisma.user.create({
//     data: {
//       name: "Admin User",
//       email: "admin@example.com",
//       password: adminPassword,
//       role: "ADMIN",
//     },
//   })

//   // Create test user
//   const userPassword = await bcrypt.hash("user123", 10)
//   const user = await prisma.user.create({
//     data: {
//       name: "Test User",
//       email: "user@example.com",
//       password: userPassword,
//       role: "USER",
//     },
//   })

//   // Create categories
//   const dairyCategory = await prisma.category.create({
//     data: {
//       id: 'dairy',
//       name: 'Dairy Products',
//       description: 'Fresh milk, curd, paneer, and more dairy products',
//     },
//   })

//   const sweetsCategory = await prisma.category.create({
//     data: {
//       id: 'sweets',
//       name: 'Sweets',
//       description: 'Traditional Indian sweets and desserts',
//     },
//   })

//   const namkeenCategory = await prisma.category.create({
//     data: {
//       id: 'namkeen',
//       name: 'Namkeen',
//       description: 'Savory snacks and mixtures',
//     },
//   })

//   // Create products
//   const cowMilk = await prisma.product.create({
//     data: {
//       name: "Fresh Cow Milk",
//       description: "Pure and fresh cow milk with rich taste and nutrients",
//       longDescription:
//         "Our fresh cow milk is sourced from healthy cows raised in natural environments. It is pasteurized to ensure safety while preserving its natural taste and nutritional benefits.",
//       price: 60,
//       discountedPrice: 55,
//       discount: 8,
//       image: "/placeholder.svg?height=400&width=400",
//       categoryId: dairyCategory.id,
//       inStock: true,
//     },
//   })

//   // Add sizes for cow milk
//   await prisma.productSize.createMany({
//     data: [
//       { value: "500ml", label: "500ml", price: 30, productId: cowMilk.id },
//       { value: "1l", label: "1 Liter", price: 55, productId: cowMilk.id },
//       { value: "2l", label: "2 Liters", price: 100, productId: cowMilk.id },
//     ],
//   })

//   // Add nutrition facts for cow milk
//   await prisma.nutritionFact.createMany({
//     data: [
//       { name: "calories", value: "65 kcal per 100ml", productId: cowMilk.id },
//       { name: "protein", value: "3.3g per 100ml", productId: cowMilk.id },
//       { name: "fat", value: "3.5g per 100ml", productId: cowMilk.id },
//       { name: "carbohydrates", value: "4.7g per 100ml", productId: cowMilk.id },
//       { name: "calcium", value: "120mg per 100ml", productId: cowMilk.id },
//     ],
//   })

//   // Add features for cow milk
//   await prisma.feature.createMany({
//     data: [
//       { text: "No preservatives added", productId: cowMilk.id },
//       { text: "Rich in calcium and protein", productId: cowMilk.id },
//       { text: "Pasteurized for safety", productId: cowMilk.id },
//       { text: "Sourced from grass-fed cows", productId: cowMilk.id },
//     ],
//   })

//   // Add reviews for cow milk
//   await prisma.review.createMany({
//     data: [
//       {
//         name: "Rahul S.",
//         rating: 5,
//         comment: "Best milk I've had in years. Very fresh and tasty.",
//         productId: cowMilk.id,
//       },
//       { name: "Priya M.", rating: 4, comment: "Good quality milk, my kids love it.", productId: cowMilk.id },
//     ],
//   })

//   // Create more products
//   const buffaloMilk = await prisma.product.create({
//     data: {
//       name: "Fresh Buffalo Milk",
//       description: "Creamy buffalo milk with higher fat content",
//       price: 80,
//       discountedPrice: 75,
//       discount: 6,
//       image: "/placeholder.svg?height=400&width=400",
//       categoryId: dairyCategory.id,
//       inStock: true,
//     },
//   })

//   await prisma.productSize.createMany({
//     data: [
//       { value: "500ml", label: "500ml", price: 40, productId: buffaloMilk.id },
//       { value: "1l", label: "1 Liter", price: 75, productId: buffaloMilk.id },
//     ],
//   })

//   const paneer = await prisma.product.create({
//     data: {
//       name: "Homemade Paneer",
//       description: "Soft and fresh cottage cheese made from pure milk",
//       price: 120,
//       image: "/placeholder.svg?height=400&width=400",
//       categoryId: dairyCategory.id,
//       inStock: true,
//     },
//   })

//   await prisma.productSize.createMany({
//     data: [
//       { value: "250g", label: "250g", price: 120, productId: paneer.id },
//       { value: "500g", label: "500g", price: 220, productId: paneer.id },
//     ],
//   })

//   const curd = await prisma.product.create({
//     data: {
//       name: "Fresh Curd",
//       description: "Thick and creamy curd made from fresh milk",
//       price: 50,
//       image: "/placeholder.svg?height=400&width=400",
//       categoryId: dairyCategory.id,
//       inStock: true,
//     },
//   })

//   await prisma.productSize.createMany({
//     data: [
//       { value: "200g", label: "200g", price: 25, productId: curd.id },
//       { value: "500g", label: "500g", price: 50, productId: curd.id },
//       { value: "1kg", label: "1kg", price: 90, productId: curd.id },
//     ],
//   })

//   // Create sweets
//   const gulabJamun = await prisma.product.create({
//     data: {
//       name: "Gulab Jamun",
//       description: "Soft milk-solid dumplings soaked in rose-flavored sugar syrup",
//       price: 200,
//       image: "/placeholder.svg?height=400&width=400",
//       categoryId: sweetsCategory.id,
//       inStock: true,
//     },
//   })

//   await prisma.productSize.createMany({
//     data: [
//       { value: "500g", label: "500g (10 pcs)", price: 200, productId: gulabJamun.id },
//       { value: "1kg", label: "1kg (20 pcs)", price: 380, productId: gulabJamun.id },
//     ],
//   })

//   const rasgulla = await prisma.product.create({
//     data: {
//       name: "Rasgulla",
//       description: "Soft and spongy cottage cheese balls soaked in sugar syrup",
//       price: 220,
//       image: "/placeholder.svg?height=400&width=400",
//       categoryId: sweetsCategory.id,
//       inStock: true,
//     },
//   })

//   await prisma.productSize.createMany({
//     data: [
//       { value: "500g", label: "500g (8 pcs)", price: 220, productId: rasgulla.id },
//       { value: "1kg", label: "1kg (16 pcs)", price: 420, productId: rasgulla.id },
//     ],
//   })

//   const kajuKatli = await prisma.product.create({
//     data: {
//       name: "Kaju Katli",
//       description: "Diamond-shaped cashew fudge with silver varq",
//       price: 600,
//       discountedPrice: 550,
//       discount: 8,
//       image: "/placeholder.svg?height=400&width=400",
//       categoryId: sweetsCategory.id,
//       inStock: true,
//     },
//   })

//   await prisma.productSize.createMany({
//     data: [
//       { value: "250g", label: "250g", price: 300, productId: kajuKatli.id },
//       { value: "500g", label: "500g", price: 550, productId: kajuKatli.id },
//       { value: "1kg", label: "1kg", price: 1050, productId: kajuKatli.id },
//     ],
//   })

//   // Create namkeen
//   const alooBhujia = await prisma.product.create({
//     data: {
//       name: "Aloo Bhujia",
//       description: "Crispy and spicy potato noodle snack",
//       price: 120,
//       image: "/placeholder.svg?height=400&width=400",
//       categoryId: namkeenCategory.id,
//       inStock: true,
//     },
//   })

//   await prisma.productSize.createMany({
//     data: [
//       { value: "200g", label: "200g", price: 120, productId: alooBhujia.id },
//       { value: "500g", label: "500g", price: 280, productId: alooBhujia.id },
//     ],
//   })

//   const mixture = await prisma.product.create({
//     data: {
//       name: "Mixture",
//       description: "Crunchy mix of various savory ingredients",
//       price: 140,
//       image: "/placeholder.svg?height=400&width=400",
//       categoryId: namkeenCategory.id,
//       inStock: true,
//     },
//   })

//   await prisma.productSize.createMany({
//     data: [
//       { value: "200g", label: "200g", price: 140, productId: mixture.id },
//       { value: "500g", label: "500g", price: 320, productId: mixture.id },
//     ],
//   })

//   console.log("Database has been seeded!")
// }

// main()
//   .catch((e) => {
//     console.error(e)
//     process.exit(1)
//   })
//   .finally(async () => {
//     await prisma.$disconnect()
//   })
