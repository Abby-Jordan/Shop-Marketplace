# 🛒 Shree Mahakali Dairy E-commerce Platform 🥛

Welcome to the **Shree Mahakali Dairy E-commerce** platform! This is a modern, full-stack web application for buying and selling dairy products, built with the latest technologies for a seamless shopping and management experience.

---

## 📚 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Environment Variables](#-environment-variables)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Roles & Workflows](#-roles--workflows)
- [Common Commands](#-common-commands)
- [Contribution Guide](#-contribution-guide)
- [License](#-license)

---

## ✨ Features
- 🧑‍💼 **Admin Dashboard**: Manage products, orders, and users.
- 👤 **User Accounts**: Register, login, manage profile, and view order history.
- 🛍️ **Product Catalog**: Browse, search, and filter dairy products.
- 🛒 **Shopping Cart & Checkout**: Add to cart, checkout, and track orders.
- 🔒 **Authentication**: Secure login/register with JWT & NextAuth.
- 📦 **Order Management**: Real-time order status, payment tracking.
- 📊 **Analytics**: Dashboard for sales and user activity (admin).
- ☁️ **Cloudinary Integration**: For product images.
- 📧 **Email Notifications**: Via SendGrid.
- 🧬 **GrapFlexible dahQL API**: ta fetching.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js, React, TailwindCSS, Radix UI
- **Backend**: Next.js API routes, Prisma ORM, PostgreSQL
- **Auth**: NextAuth, JWT
- **API**: GraphQL, Apollo Client/Server
- **Other**: Cloudinary, SendGrid, Zod, AI SDK (OpenAI)

---

## 🌱 Environment Variables
Create a `.env` file in the root with the following:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/shop_marketplace
JWT_SECRET=your_jwt_secret
SENDGRID_API_KEY=your_sendgrid_key
FRONTEND_URL=http://localhost:3000
EMAIL_FROM=your@email.com
NEXTAUTH_SECRET=your_nextauth_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

> **Note:** Never commit real secrets to version control!

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v20+ recommended)
- Yarn or npm
- PostgreSQL database

### 1. Clone the repo
```bash
git clone <repo-url>
cd smd-ecommerce
```

### 2. Install dependencies
```bash
yarn install
# or
npm install
```

### 3. Setup environment variables
Copy `.env.example` to `.env` and fill in your values.

### 4. Database setup
```bash
yarn prisma:generate
yarn prisma:migrate
yarn prisma:seed # (optional, if you have a seed script)
```

### 5. Run the development server
```bash
yarn dev
# or
npm run dev
```
Visit [http://localhost:3000](http://localhost:3000) 🚀

---

## 🗂️ Project Structure
```
├── app/
│   ├── admin/
│   │   └── page.tsx
│   ├── api/
│   │   ├── auth/
│   │   └── page.tsx
│   ├── cart/
│   │   └── page.tsx
│   ├── category/
│   │   └── [slug]/
│   ├── change-password/
│   │   └── page.tsx
│   ├── checkout/
│   │   └── [orderId]/
│   ├── forgot-password/
│   │   └── page.tsx
│   ├── orders/
│   │   ├── page.tsx
│   │   └── [id]/
│   ├── product/
│   │   └── [id]/
│   ├── profile/
│   │   ├── ProfileClient.tsx
│   │   └── page.tsx
│   ├── reset-password/
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   ├── not-found.tsx
│   └── page.tsx
├── components/
│   ├── admin/
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminOrders.tsx
│   │   ├── AdminProducts.tsx
│   │   └── AdminUsers.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   ├── chat/
│   │   ├── AIChatButton.tsx
│   │   └── AIChatDialog.tsx
│   ├── home/
│   │   ├── CategorySection.tsx
│   │   ├── FeaturedProducts.tsx
│   │   └── Hero.tsx
│   ├── layout/
│   │   └── Header.tsx
│   ├── products/
│   │   ├── AddToCartButton.tsx
│   │   ├── ProductCard.tsx
│   │   ├── ProductDetails.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── ProductSkeleton.tsx
│   │   └── RelatedProducts.tsx
│   ├── ui/
│   │   └── [many UI components]
│   ├── ApolloWrapper.tsx
│   └── theme-provider.tsx
├── context/
│   ├── AuthContext.tsx
│   └── CartContext.tsx
├── graphql/
│   ├── graphql-types.ts
│   ├── mutation.ts
│   ├── permissions.ts
│   ├── queries.ts
│   ├── resolvers.ts
│   └── schema.ts
├── hooks/
│   ├── use-mobile.tsx
│   └── use-toast.ts
├── lib/
│   ├── ai.ts
│   ├── api.ts
│   ├── apollo-client.ts
│   ├── auth.ts
│   ├── mock-data.ts
│   ├── payment.ts
│   ├── prisma.ts
│   ├── userActivity.ts
│   └── utils.ts
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── uploads/
│   ├── android-chrome-192x192.png
│   ├── android-chrome-512x512.png
│   ├── apple-touch-icon.png
│   ├── default-avatar.png
│   ├── favicon-16x16.png
│   ├── favicon-32x32.png
│   ├── favicon.ico
│   ├── icon.svg
│   ├── logo.png
│   ├── placeholder-logo.png
│   ├── placeholder-logo.svg
│   ├── placeholder-user.jpg
│   ├── placeholder.jpg
│   └── placeholder.svg
├── styles/
│   └── globals.css
├── types/
│   ├── product.ts
│   └── user.ts
├── .env
├── .env.development.local
├── .gitignore
├── codegen.yml
├── components.json
├── middleware.ts
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── pnpm-lock.yaml
├── postcss.config.mjs
├── README.md
├── run.sh
├── tailwind.config.ts
├── tsconfig.json
├── yarn-error.log
├── yarn.lock
```

---

## 👥 Roles & Workflows

### 🧑‍💼 Admin
- Access `/admin` dashboard
- Manage products, orders, and users
- View analytics and sales data
- Workflow:
  1. Login as admin
  2. Use dashboard tabs to manage products, orders, users
  3. Update product info, process orders, manage user roles

### 🛍️ User
- Register/login via `/auth`
- Browse products, add to cart, checkout
- View and manage profile via `/profile`
- Track orders and order history
- Workflow:
  1. Register or login
  2. Browse products, add to cart
  3. Checkout and track orders
  4. Update profile and preferences

### 👨‍💻 Developer
- Setup project as above
- Use scripts for codegen, migrations, linting
- Workflow:
  1. Install dependencies
  2. Setup `.env` and database
  3. Run `yarn dev` for development
  4. Use `yarn codegen` for GraphQL types
  5. Use `yarn prisma:migrate` for DB changes

---

## 📝 Common Commands
- `yarn dev` — Start dev server
- `yarn build` — Build for production
- `yarn start` — Start production server
- `yarn lint` — Lint code
- `yarn codegen` — Generate GraphQL types
- `yarn prisma:generate` — Generate Prisma client
- `yarn prisma:migrate` — Run DB migrations
- `yarn prisma:studio` — Open Prisma Studio

---

## 🤝 Contribution Guide
1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a pull request 🚀

For major changes, please open an issue first to discuss what you'd like to change.

---

## 📄 License
This project is licensed under the MIT License.

---

> Made with ❤️ for the dairy community! 