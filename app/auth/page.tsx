"use client"

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import LoginForm from "@/components/auth/LoginForm"
import RegisterForm from "@/components/auth/RegisterForm"

export default function AuthPage() {
  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <div className="w-full max-w-md">
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <LoginForm />
            </Card>
          </TabsContent>

          <TabsContent value="register">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>Register to start shopping at Shree Mahakali Dairy</CardDescription>
              </CardHeader>
              <RegisterForm />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 