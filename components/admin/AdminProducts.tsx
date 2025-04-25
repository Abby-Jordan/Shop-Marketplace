"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Pencil, Trash2, Plus, Search, UploadCloud } from "lucide-react"
import { useMutation, useQuery, gql } from "@apollo/client"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/product"

const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct(
    $id: ID!
    $name: String
    $description: String
    $longDescription: String
    $price: Float
    $discountedPrice: Float
    $discount: Int
    $image: String
    $categoryId: ID
    $inStock: Boolean
    $sizes: [ProductSizeInput!]
    $nutritionFacts: [NutritionFactInput!]
    $features: [FeatureInput!]
  ) {
    updateProduct(
      id: $id
      name: $name
      description: $description
      longDescription: $longDescription
      price: $price
      discountedPrice: $discountedPrice
      discount: $discount
      image: $image
      categoryId: $categoryId
      inStock: $inStock
      sizes: $sizes
      nutritionFacts: $nutritionFacts
      features: $features
    ) {
      id
      name
      description
      longDescription
      price
      discountedPrice
      discount
      image
      categoryId
      inStock
      createdAt
      updatedAt
      sizes {
        id
        value
        label
        price
      }
      nutritionFacts {
        id
        name
        value
      }
      features {
        id
        text
      }
    }
  }
`

const GET_PRODUCTS_QUERY = gql`
  query GetProducts {
    products(orderBy: { field: "updatedAt", direction: "desc" }) {
      id
      name
      description
      longDescription
      price
      discountedPrice
      discount
      image
      categoryId
      inStock
      createdAt
      updatedAt
      sizes {
        id
        value
        label
        price
      }
      nutritionFacts {
        id
        name
        value
      }
      features {
        id
        text
      }
    }
  }
`

const GET_CATEGORIES_QUERY = gql`
  query GetCategories {
    categories {
      id
      name
    }
  }
`

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct(
    $name: String!
    $description: String!
    $longDescription: String
    $price: Float!
    $discountedPrice: Float
    $discount: Int
    $image: String!
    $categoryId: ID!
    $inStock: Boolean!
    $sizes: [ProductSizeInput!]
    $nutritionFacts: [NutritionFactInput!]
    $features: [FeatureInput!]
  ) {
    createProduct(
      name: $name
      description: $description
      longDescription: $longDescription
      price: $price
      discountedPrice: $discountedPrice
      discount: $discount
      image: $image
      categoryId: $categoryId
      inStock: $inStock
      sizes: $sizes
      nutritionFacts: $nutritionFacts
      features: $features
    ) {
      id
      name
      description
      longDescription
      price
      discountedPrice
      discount
      image
      categoryId
      inStock
      createdAt
      updatedAt
      sizes {
        id
        value
        label
        price
      }
      nutritionFacts {
        id
        name
        value
      }
      features {
        id
        text
      }
    }
  }
`

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
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    longDescription: "",
    price: "",
    discountedPrice: "",
    image: "",
    categoryId: "",
    inStock: true,
    sizes: [] as { value: string; label: string; price: string }[],
    nutritionFacts: [] as { name: string; value: string }[],
    features: [] as { text: string }[],
  })
  const [formErrors, setFormErrors] = useState({
    name: "",
    description: "",
    price: "",
    categoryId: "",
    image: "",
    discountedPrice: "",
  })
  const { toast } = useToast()

  // Fetch products and categories
  const { data: productsData, loading: productsLoading, refetch: refetchProducts, error: productsError } = useQuery(GET_PRODUCTS_QUERY, {
    fetchPolicy: "network-only", // This ensures we always get fresh data
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to fetch products. Please try again.",
        variant: "destructive",
      })
    }
  })
  const { data: categoriesData } = useQuery(GET_CATEGORIES_QUERY)
  
  // No need for client-side sorting since server handles it
  const products = productsData?.products || []
  const categories = categoriesData?.categories || []

  // Update product mutation
  const [updateProduct] = useMutation(UPDATE_PRODUCT_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Product Updated",
        description: "The product has been updated successfully.",
      })
      refetchProducts() // This will trigger a fresh fetch with server-side sorting
      setIsEditDialogOpen(false)
    },
    onError: (error) => {
      console.error('Update error:', error)
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the product. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Create product mutation
  const [createProduct] = useMutation(CREATE_PRODUCT_MUTATION, {
    onCompleted: () => {
      toast({
        title: "Product Created",
        description: "The product has been created successfully.",
      })
      refetchProducts()
      setIsAddDialogOpen(false)
      resetForm()
    },
    onError: (error) => {
      console.error('Create error:', error)
      toast({
        title: "Create Failed",
        description: error.message || "There was an error creating the product. Please try again.",
        variant: "destructive",
      })
    },
  })

  const filteredProducts = products.filter(
    (product: Product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      longDescription: "",
      price: "",
      discountedPrice: "",
      image: "",
      categoryId: "",
      inStock: true,
      sizes: [],
      nutritionFacts: [],
      features: []
    })
    setFormErrors({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      image: "",
      discountedPrice: "",
    })
    setCurrentProduct(null)
  }

  const handleAddClick = () => {
    resetForm()
    setIsAddDialogOpen(true)
  }

  const handleEdit = (product: Product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      longDescription: product.longDescription || "",
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() || "",
      image: product.image,
      categoryId: product.categoryId,
      inStock: product.inStock,
      sizes: product.sizes?.map(size => ({
        value: size.value,
        label: size.label,
        price: size.price.toString()
      })) || [],
      nutritionFacts: product.nutritionFacts?.map(fact => ({
        name: fact.name,
        value: fact.value
      })) || [],
      features: product.features?.map(feature => ({
        text: feature.text
      })) || []
    })
    setFormErrors({
      name: "",
      description: "",
      price: "",
      categoryId: "",
      image: "",
      discountedPrice: "",
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setCurrentProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (currentProduct) {
      // Implement delete mutation here
      setIsDeleteDialogOpen(false)
    }
  }

  const handleAddOrUpdate = async () => {
    if (!validateForm()) {
      return
    }

    if (currentProduct) {
      // Calculate discount percentage
      const price = Number(formData.price)
      const discountedPrice = Number(formData.discountedPrice)
      const discount = discountedPrice ? Math.round(((price - discountedPrice) / price) * 100) : 0

      try {
        // Update product
        await updateProduct({
          variables: {
            id: currentProduct.id,
            name: formData.name,
            description: formData.description,
            longDescription: formData.longDescription,
            price: price,
            discountedPrice: discountedPrice || null,
            discount: discount || null,
            image: formData.image,
            categoryId: formData.categoryId,
            inStock: formData.inStock,
            sizes: formData.sizes.map(size => ({
              value: size.value,
              label: size.label,
              price: Number(size.price)
            })),
            nutritionFacts: formData.nutritionFacts,
            features: formData.features
          }
        })
      } catch (error) {
        console.error('Update error:', error)
        toast({
          title: "Update Failed",
          description: "There was an error updating the product. Please try again.",
          variant: "destructive",
        })
      }
    } else {
      try {
        // Calculate discount percentage
        const price = Number(formData.price)
        const discountedPrice = Number(formData.discountedPrice)
        const discount = discountedPrice ? Math.round(((price - discountedPrice) / price) * 100) : 0

        // Create product
        await createProduct({
          variables: {
            name: formData.name,
            description: formData.description,
            longDescription: formData.longDescription,
            price: price,
            discountedPrice: discountedPrice || null,
            discount: discount || null,
            image: formData.image,
            categoryId: formData.categoryId,
            inStock: formData.inStock,
            sizes: formData.sizes.map(size => ({
              value: size.value,
              label: size.label,
              price: Number(size.price)
            })),
            nutritionFacts: formData.nutritionFacts,
            features: formData.features
          }
        })
      } catch (error) {
        console.error('Create error:', error)
        toast({
          title: "Create Failed",
          description: "There was an error creating the product. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string })
        setFormErrors({ ...formErrors, image: "" })
      }
      reader.readAsDataURL(file)
    }
  }

  const addSize = () => {
    setFormData({
      ...formData,
      sizes: [...formData.sizes, { value: "", label: "", price: "" }]
    })
  }

  const removeSize = (index: number) => {
    setFormData({
      ...formData,
      sizes: formData.sizes.filter((_, i) => i !== index)
    })
  }

  const addNutritionFact = () => {
    setFormData({
      ...formData,
      nutritionFacts: [...formData.nutritionFacts, { name: "", value: "" }]
    })
  }

  const removeNutritionFact = (index: number) => {
    setFormData({
      ...formData,
      nutritionFacts: formData.nutritionFacts.filter((_, i) => i !== index)
    })
  }

  const addFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { text: "" }]
    })
  }

  const removeFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    })
  }

  const validateForm = () => {
    const errors = {
      name: "",
      description: "",
      price: "",
      categoryId: "",
      image: "",
      discountedPrice: "",
    }

    if (!formData.name.trim()) {
      errors.name = "Name is required"
    }
    if (!formData.description.trim()) {
      errors.description = "Description is required"
    }
    if (!formData.price.trim()) {
      errors.price = "Price is required"
    }
    if (!formData.categoryId) {
      errors.categoryId = "Category is required"
    }
    if (!formData.image) {
      errors.image = "Image is required"
    }
    if(formData.discountedPrice && Number(formData.discountedPrice) >= Number(formData.price)) {
      errors.discountedPrice = "Discounted price cannot be greater than or equal to the price"
    }
    if(formData.discountedPrice && Number(formData.discountedPrice) < 0) {
      errors.discountedPrice = "Discounted price cannot be negative"
    }

    console.log(errors)
    setFormErrors(errors)
    return !Object.values(errors).some(error => error !== "")
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

        <Button onClick={handleAddClick} className="bg-red-600 hover:bg-red-700">
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

      {/* Add/Edit Product Dialog */}
      <Dialog open={isAddDialogOpen || isEditDialogOpen} onOpenChange={() => {
        setIsAddDialogOpen(false)
        setIsEditDialogOpen(false)
        resetForm()
      }}>
        <DialogContent className="max-w-xl max-h-[90vh] flex flex-col" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>{currentProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              Fill in the form below to {currentProduct ? "update" : "add a new"} product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto pr-2 flex-grow">
            <div>
              <Label>Name *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setFormErrors({ ...formErrors, name: "" })
                }} 
              />
              {formErrors.name && <p className="text-sm text-red-500 mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <Label>Description *</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => {
                  setFormData({ ...formData, description: e.target.value })
                  setFormErrors({ ...formErrors, description: "" })
                }} 
                className="h-20" 
              />
              {formErrors.description && <p className="text-sm text-red-500 mt-1">{formErrors.description}</p>}
            </div>
            <div>
              <Label>Long Description</Label>
              <Textarea value={formData.longDescription} onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })} className="h-20" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price *</Label>
                <Input 
                  type="number" 
                  value={formData.price} 
                  onChange={(e) => {
                    setFormData({ ...formData, price: e.target.value })
                    setFormErrors({ ...formErrors, price: "" })
                  }} 
                />
                {formErrors.price && <p className="text-sm text-red-500 mt-1">{formErrors.price}</p>}
              </div>
              <div>
                <Label>Discounted Price</Label>
                <Input type="number" value={formData.discountedPrice} onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })} />
                {formErrors.discountedPrice && <p className="text-sm text-red-500 mt-1">{formErrors.discountedPrice}</p>}
              </div>
            </div>
            <div>
              <Label>Category *</Label>
              <Select
                value={formData.categoryId}
                onValueChange={(value) => {
                  setFormData({ ...formData, categoryId: value })
                  setFormErrors({ ...formErrors, categoryId: "" })
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.categoryId && <p className="text-sm text-red-500 mt-1">{formErrors.categoryId}</p>}
            </div>
            <div>
              <Label>Stock</Label>
              <select value={formData.inStock ? "yes" : "no"} onChange={(e) => setFormData({ ...formData, inStock: e.target.value === "yes" })} className="w-full border rounded p-2">
                <option value="yes">In Stock</option>
                <option value="no">Out of Stock</option>
              </select>
            </div>
            <div>
              <Label>Product Image *</Label>
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageChange}
                className={formErrors.image ? "border-red-500" : ""}
              />
              {formData.image && <img src={formData.image} alt="Preview" className="h-20 mt-2 rounded" />}
              {formErrors.image && <p className="text-sm text-red-500 mt-1">{formErrors.image}</p>}
            </div>

            {/* Sizes Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Sizes</Label>
                <Button type="button" variant="outline" size="sm" onClick={addSize}>
                  Add Size
                </Button>
              </div>
              {formData.sizes.map((size, index) => (
                <div key={index} className="grid grid-cols-3 gap-2 mb-2">
                  <Input
                    placeholder="Value"
                    value={size.value}
                    onChange={(e) => {
                      const newSizes = [...formData.sizes]
                      newSizes[index].value = e.target.value
                      setFormData({ ...formData, sizes: newSizes })
                    }}
                  />
                  <Input
                    placeholder="Label"
                    value={size.label}
                    onChange={(e) => {
                      const newSizes = [...formData.sizes]
                      newSizes[index].label = e.target.value
                      setFormData({ ...formData, sizes: newSizes })
                    }}
                  />
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Price"
                      value={size.price}
                      onChange={(e) => {
                        const newSizes = [...formData.sizes]
                        newSizes[index].price = e.target.value
                        setFormData({ ...formData, sizes: newSizes })
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeSize(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Nutrition Facts Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Nutrition Facts</Label>
                <Button type="button" variant="outline" size="sm" onClick={addNutritionFact}>
                  Add Nutrition Fact
                </Button>
              </div>
              {formData.nutritionFacts.map((fact, index) => (
                <div key={index} className="grid grid-cols-2 gap-2 mb-2">
                  <Input
                    placeholder="Name"
                    value={fact.name}
                    onChange={(e) => {
                      const newFacts = [...formData.nutritionFacts]
                      newFacts[index].name = e.target.value
                      setFormData({ ...formData, nutritionFacts: newFacts })
                    }}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Value"
                      value={fact.value}
                      onChange={(e) => {
                        const newFacts = [...formData.nutritionFacts]
                        newFacts[index].value = e.target.value
                        setFormData({ ...formData, nutritionFacts: newFacts })
                      }}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeNutritionFact(index)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Features Section */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label>Features</Label>
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  Add Feature
                </Button>
              </div>
              {formData.features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    placeholder="Feature text"
                    value={feature.text}
                    onChange={(e) => {
                      const newFeatures = [...formData.features]
                      newFeatures[index].text = e.target.value
                      setFormData({ ...formData, features: newFeatures })
                    }}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={() => removeFeature(index)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex-shrink-0 mt-4">
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              setIsEditDialogOpen(false)
              resetForm()
            }}>
              Cancel
            </Button>
            <Button onClick={handleAddOrUpdate}>{currentProduct ? "Update" : "Add"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}