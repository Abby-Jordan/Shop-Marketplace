"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { UserSchema, type UserFormData } from "@/lib/validations"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface UserFormProps {
  onSubmit: (data: UserFormData) => void
  isLoading: boolean
  initialData?: {
    name: string
    email: string
    isAdmin: boolean
    status?: "ACTIVE" | "INACTIVE" | "DEACTIVATED"
  }
  mode: "create" | "edit"
}

export default function UserForm({ onSubmit, isLoading, initialData, mode }: UserFormProps) {
  const form = useForm<UserFormData>({
    resolver: zodResolver(UserSchema),
    defaultValues: {
      name: initialData?.name || "",
      email: initialData?.email || "",
      isAdmin: initialData?.isAdmin || false,
      status: initialData?.status || "ACTIVE"
    },
  })

  const handleSubmit = (data: UserFormData) => {
    onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter user name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="Enter email address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {mode === "edit" && (
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={form.control}
          name="isAdmin"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Administrator Access
                </FormLabel>
                <p className="text-sm text-muted-foreground">
                  Grant this user administrator privileges
                </p>
              </div>
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-red-600 hover:bg-red-700" 
          disabled={isLoading}
        >
          {isLoading 
            ? `${mode === 'create' ? 'Creating' : 'Updating'} User...` 
            : `${mode === 'create' ? 'Create' : 'Update'} User`}
        </Button>
      </form>
    </Form>
  )
} 