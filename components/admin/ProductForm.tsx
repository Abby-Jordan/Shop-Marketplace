"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ProductSchema, type ProductFormData } from "@/lib/validations"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Image from "next/image"
import { X, Plus, Trash2 } from "lucide-react"

interface ProductFormProps {
  onSubmit: (data: ProductFormData, imageFile: File | null) => void
  isLoading: boolean
  initialData?: {
    name: string
    description: string
    longDescription?: string
    price: number
    discountedPrice?: number
    image: string | null
    categoryId: string
    inStock: boolean
    sizes: { value: string; label: string; price: number }[]
    nutritionFacts: { name: string; value: string }[]
    features: { text: string }[]
  }
  categories: { id: string; name: string }[]
  mode: "create" | "edit"
}

export default function ProductForm({ onSubmit, isLoading, initialData, categories, mode }: ProductFormProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.image || null)
  const [selectedImage, setSelectedImage] = useState<File | null>(null)

  const form = useForm<ProductFormData>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      longDescription: initialData?.longDescription || "",
      price: initialData?.price?.toString() || "",
      discountedPrice: initialData?.discountedPrice?.toString() || "",
      image: initialData?.image || null,
      categoryId: initialData?.categoryId || "",
      inStock: initialData?.inStock ?? true,
      sizes: initialData?.sizes?.map(size => ({
        value: size.value,
        label: size.label,
        price: size.price.toString()
      })) || [],
      nutritionFacts: initialData?.nutritionFacts || [],
      features: initialData?.features || []
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

  const handleFormSubmit = (data: ProductFormData) => {
    if (mode === "create" && !selectedImage && !initialData?.image) {
      form.setError('image', {
        type: 'manual',
        message: 'Image is required'
      })
      return
    }
    onSubmit(data, selectedImage)
  }

  const addSize = () => {
    const currentSizes = form.getValues('sizes') || []
    form.setValue('sizes', [...currentSizes, { value: "", label: "", price: "" }])
  }

  const removeSize = (index: number) => {
    const currentSizes = form.getValues('sizes') || []
    form.setValue('sizes', currentSizes.filter((_, i) => i !== index))
  }

  const addNutritionFact = () => {
    const currentFacts = form.getValues('nutritionFacts') || []
    form.setValue('nutritionFacts', [...currentFacts, { name: "", value: "" }])
  }

  const removeNutritionFact = (index: number) => {
    const currentFacts = form.getValues('nutritionFacts') || []
    form.setValue('nutritionFacts', currentFacts.filter((_, i) => i !== index))
  }

  const addFeature = () => {
    const currentFeatures = form.getValues('features') || []
    form.setValue('features', [...currentFeatures, { text: "" }])
  }

  const removeFeature = (index: number) => {
    const currentFeatures = form.getValues('features') || []
    form.setValue('features', currentFeatures.filter((_, i) => i !== index))
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
        <div className="flex flex-col items-center mb-6">
          <div className="relative w-48 h-48 mb-4 group">
            <Image
              src={previewImage || 'default-upload-image.jpg'}
              alt="Product"
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
              id="product-image"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => document.getElementById('product-image')?.click()}
              className="w-full"
            >
              {previewImage ? 'Change Product Image' : 'Add Product Image'}
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
              <FormLabel>Product Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter product name" {...field} />
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
                  placeholder="Enter product description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="longDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Long Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter detailed product description"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="discountedPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Discounted Price</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter discounted price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="inStock"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Status</FormLabel>
              <Select
                onValueChange={(value) => field.onChange(value === "true")}
                defaultValue={field.value ? "true" : "false"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select stock status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="true">In Stock</SelectItem>
                  <SelectItem value="false">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Sizes</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={addSize}>
              <Plus className="h-4 w-4 mr-2" />
              Add Size
            </Button>
          </div>
          {form.watch('sizes')?.map((_, index) => (
            <div key={index} className="grid grid-cols-3 gap-2 mb-2">
              <FormField
                control={form.control}
                name={`sizes.${index}.value`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Value" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`sizes.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Label" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`sizes.${index}.price`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input type="number" placeholder="Price" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => removeSize(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Nutrition Facts</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={addNutritionFact}>
              <Plus className="h-4 w-4 mr-2" />
              Add Nutrition Fact
            </Button>
          </div>
          {form.watch('nutritionFacts')?.map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-2 mb-2">
              <FormField
                control={form.control}
                name={`nutritionFacts.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div className="flex gap-2">
                <FormField
                  control={form.control}
                  name={`nutritionFacts.${index}.value`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Value" {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="button" variant="outline" size="icon" onClick={() => removeNutritionFact(index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <FormLabel>Features</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={addFeature}>
              <Plus className="h-4 w-4 mr-2" />
              Add Feature
            </Button>
          </div>
          {form.watch('features')?.map((_, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <FormField
                control={form.control}
                name={`features.${index}.text`}
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <Input placeholder="Feature text" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(index)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>

        <Button 
          type="submit" 
          className="w-full bg-red-600 hover:bg-red-700" 
          disabled={isLoading}
        >
          {isLoading 
            ? `${mode === 'create' ? 'Creating' : 'Updating'} Product...` 
            : `${mode === 'create' ? 'Create' : 'Update'} Product`}
        </Button>
      </form>
    </Form>
  )
} 