"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Pencil, Trash2, Plus, Search } from "lucide-react"
import { useMutation, useQuery } from "@apollo/client"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/product"
import { GET_PRODUCTS_QUERY, GET_CATEGORIES_QUERY } from '../../graphql/queries'
import { UPDATE_PRODUCT_MUTATION, CREATE_PRODUCT_MUTATION, DELETE_PRODUCT_MUTATION } from '../../graphql/mutation'
import ProductForm from "./ProductForm"
import { ProductFormData } from "@/lib/validations"

interface Category {
  id: string
  name: string
}

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const { data: productsData, loading: productsLoading, refetch: refetchProducts } = useQuery(GET_PRODUCTS_QUERY, {
    fetchPolicy: "network-only",
  })
  const { data: categoriesData } = useQuery(GET_CATEGORIES_QUERY)

  const [createProduct] = useMutation(CREATE_PRODUCT_MUTATION)
  const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION)
  const [deleteProduct] = useMutation(DELETE_PRODUCT_MUTATION)

  const { toast } = useToast()

  const products = productsData?.products || []
  const categories = categoriesData?.categories || []

  const filteredProducts = products.filter(
    (product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreate = async (data: ProductFormData, imageFile: File | null) => {
    setIsLoading(true)
    try {
      let imageUrl = null

      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)

        const response = await fetch('/api/product/image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'categoryId': data.categoryId
          }
        })

        if (!response.ok) throw new Error('Image upload failed')
        const responseData = await response.json()
        imageUrl = responseData.imageUrl
      }

      // Calculate discount percentage
      const price = Number(data.price)
      const discountedPrice = data.discountedPrice ? Number(data.discountedPrice) : null
      const discount = discountedPrice ? Math.round(((price - discountedPrice) / price) * 100) : null

      await createProduct({
        variables: {
          name: data.name,
          description: data.description,
          longDescription: data.longDescription,
          price: price,
          discountedPrice: discountedPrice,
          discount: discount,
          image: imageUrl,
          categoryId: data.categoryId,
          inStock: data.inStock,
          sizes: data.sizes?.map(size => ({
            value: size.value,
            label: size.label,
            price: Number(size.price)
          })) || [],
          nutritionFacts: data.nutritionFacts || [],
          features: data.features || []
        },
      })

      toast({
        title: "Product Created",
        description: "The product has been created successfully.",
      })
      setIsAddDialogOpen(false)
      refetchProducts()
    } catch (error: any) {
      toast({
        title: "Create Failed",
        description: error.message || "There was an error creating the product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdate = async (data: ProductFormData, imageFile: File | null) => {
    if (!currentProduct) return

    setIsLoading(true)
    try {
      let imageUrl = currentProduct.image

      if (imageFile) {
        const formData = new FormData()
        formData.append('file', imageFile)

        const response = await fetch('/api/product/image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'categoryId': data.categoryId,
            'Old-Image-Url': currentProduct.image || ''
          }
        })

        if (!response.ok) throw new Error('Image upload failed')
        const responseData = await response.json()
        imageUrl = responseData.imageUrl
      }

      // Calculate discount percentage
      const price = Number(data.price)
      const discountedPrice = data.discountedPrice ? Number(data.discountedPrice) : null
      const discount = discountedPrice ? Math.round(((price - discountedPrice) / price) * 100) : null

      await updateProduct({
        variables: {
          id: currentProduct.id,
          name: data.name,
          description: data.description,
          longDescription: data.longDescription,
          price: price,
          discountedPrice: discountedPrice,
          discount: discount,
          image: imageUrl,
          categoryId: data.categoryId,
          inStock: data.inStock,
          sizes: data.sizes?.map(size => ({
            value: size.value,
            label: size.label,
            price: Number(size.price)
          })) || [],
          nutritionFacts: data.nutritionFacts || [],
          features: data.features || []
        },
      })

      toast({
        title: "Product Updated",
        description: "The product has been updated successfully.",
      })
      setIsEditDialogOpen(false)
      refetchProducts()
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the product. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = (product: Product) => {
    setCurrentProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentProduct) return

    try {
      await deleteProduct({
        variables: {
          deleteProductId: currentProduct.id
        }
      })
      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully.",
      })
      setIsDeleteDialogOpen(false)
      refetchProducts()
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "There was an error deleting the product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: Product) => {
    setCurrentProduct(product)
    setIsEditDialogOpen(true)
  }

  const mapProductToFormData = (product: Product) => ({
    name: product.name,
    description: product.description,
    longDescription: product.longDescription || "",
    price: product.price,
    discountedPrice: product.discountedPrice || undefined,
    image: product.image,
    categoryId: product.categoryId,
    inStock: product.inStock,
    sizes: product.sizes?.map(size => ({
      value: size.value,
      label: size.label,
      price: size.price
    })) || [],
    nutritionFacts: product.nutritionFacts || [],
    features: product.features || []
  })

  if (productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search products..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Button onClick={() => setIsAddDialogOpen(true)} className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Add Product
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product: Product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded" />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>
                  {categories.find((cat: Category) => cat.id === product.categoryId)?.name || product.categoryId}
                </TableCell>
                <TableCell>₹{product.discountedPrice || product.price}</TableCell>
                <TableCell>{product.inStock ? "In Stock" : "Out of Stock"}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(product)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{currentProduct?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Product Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
            <DialogDescription>
              Fill in the form below to add a new product.
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            onSubmit={handleCreate}
            isLoading={isLoading}
            categories={categories}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>
              Update the product information below.
            </DialogDescription>
          </DialogHeader>
          {currentProduct && (
            <ProductForm
              onSubmit={handleUpdate}
              isLoading={isLoading}
              initialData={mapProductToFormData(currentProduct)}
              categories={categories}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}