import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "@/components/layout/Header"
import { CartProvider } from "@/context/CartContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { ApolloWrapper } from "@/components/ApolloWrapper"
import { AuthProvider } from "@/context/AuthContext"
import Footer from "@/components/layout/Footer"
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Shree Mahakali Dairy",
  description: "Your trusted source for quality dairy products",
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        url: "/favicon-48x48.png",
        sizes: "48x48",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    other: [
      {
        rel: "android-chrome",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        rel: "android-chrome",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="light" style={{ colorScheme: "light" }}>
      <body className={inter.className}>
        <ApolloWrapper>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
            <AuthProvider>
              <CartProvider>
                <Header />
                <main className="min-h-screen pt-16 bg-gray-50 dark:bg-gray-900">{children}</main>
                <Footer />
                <Toaster />
              </CartProvider>
            </AuthProvider>
          </ThemeProvider>
        </ApolloWrapper>
      </body>
    </html>
  )
}
