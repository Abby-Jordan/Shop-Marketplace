"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CategorySchema, type CategoryFormData } from "@/lib/validations"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { X } from "lucide-react"

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData, imageFile: File | null) => void
  isLoading: boolean
  initialData?: {
    name: string
    description: string
    image: string | null
  }
  mode: "create" | "edit"
}

export default function CategoryForm({ onSubmit, isLoading, initialData, mode }: CategoryFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image || null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  const form = useForm<CategoryFormData>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      image: initialData?.image || null,
    },
  })

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      form.setValue('image', file, { shouldValidate: true })
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setSelectedImage(null)
    setPreviewImage(initialData?.image || null)
    form.setValue('image', null, { shouldValidate: true })
  }

  const handleFormSubmit = (data: CategoryFormData) => {
    if (mode === "create" && !selectedImage && !initialData?.image) {
      form.setError('image', {
        type: 'manual',
        message: 'Image is required'
      })
      return
    }
    onSubmit(data, selectedImage)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-48 h-48 mb-4 group">
            <Image
              src={previewImage || '/default-upload-image.jpg'}
              alt="Category"
              fill
              className="rounded-lg object-cover"
            />
            {previewImage && (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-700"
                title="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="text-center w-full">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
              id="category-image"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('category-image')?.click()}
              className="w-full"
            >
              {previewImage ? 'Change Category Image' : 'Add Category Image'}
            </Button>
            {form.formState.errors.image?.message && typeof form.formState.errors.image.message === 'string' && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.image.message}</p>
            )}
          </div>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter category name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter category description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button 
          type="submit" 
          className="w-full bg-red-600 hover:bg-red-700" 
          disabled={isLoading}
        >
          {isLoading 
            ? `${mode === 'create' ? 'Creating' : 'Updating'} Category...` 
            : `${mode === 'create' ? 'Create' : 'Update'} Category`}
        </Button>
      </form>
    </Form>
  )
} 