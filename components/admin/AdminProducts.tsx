"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
import { Pencil, Trash2, Plus, Search, UploadCloud } from "lucide-react"
import { mockProducts } from "@/lib/mock-data"
import type { Product } from "@/types/product"

export default function AdminProducts() {
  const [products, setProducts] = useState(mockProducts)
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    price: "",
    discountedPrice: "",
    inStock: true,
    image: "",
  })

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleEdit = (product: Product) => {
    setCurrentProduct(product)
    setFormData({
      name: product.name,
      categoryId: product.categoryId,
      price: product.price.toString(),
      discountedPrice: product.discountedPrice?.toString() ?? "",
      inStock: product.inStock,
      image: product.image
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (product: Product) => {
    setCurrentProduct(product)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (currentProduct) {
      setProducts(products.filter((p) => p.id !== currentProduct.id))
      setIsDeleteDialogOpen(false)
    }
  }

  const handleAddOrUpdate = () => {
    if (currentProduct) {
      // Update
      setProducts(products.map((p) => (p.id === currentProduct.id ? { 
        ...formData,
        id: p.id,
        description: currentProduct.description,
        price: Number(formData.price),
        discountedPrice: Number(formData.discountedPrice)
      } : p)))
      setIsEditDialogOpen(false)
    } else {
      // Add
      const newProduct = {
        ...formData,
        id: Date.now().toString(),
        description: "",
        price: Number(formData.price),
        discountedPrice: Number(formData.discountedPrice)
      }
      setProducts([...products, newProduct])
      setIsAddDialogOpen(false)
    }
    setFormData({ name: "", categoryId: "", price: "", discountedPrice: "", inStock: true, image: "" })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string })
      }
      reader.readAsDataURL(file)
    }
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
            {filteredProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-10 w-10 object-cover rounded" />
                  ) : (
                    "-"
                  )}
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.categoryId}</TableCell>
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
        setFormData({ name: "", categoryId: "", price: "", discountedPrice: "", inStock: true, image: "" })
        setCurrentProduct(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            <DialogDescription>
              Fill in the form below to {currentProduct ? "update" : "add a new"} product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            </div>
            <div>
              <Label>Category</Label>
              <Input value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })} />
            </div>
            <div>
              <Label>Price</Label>
              <Input type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            </div>
            <div>
              <Label>Discounted Price</Label>
              <Input type="number" value={formData.discountedPrice} onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })} />
            </div>
            <div>
              <Label>Stock</Label>
              <select value={formData.inStock ? "yes" : "no"} onChange={(e) => setFormData({ ...formData, inStock: e.target.value === "yes" })} className="w-full border rounded p-2">
                <option value="yes">In Stock</option>
                <option value="no">Out of Stock</option>
              </select>
            </div>
            <div>
              <Label>Product Image</Label>
              <Input type="file" accept="image/*" onChange={handleImageChange} />
              {formData.image && <img src={formData.image} alt="Preview" className="h-20 mt-2 rounded" />}
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false)
              setIsEditDialogOpen(false)
              setFormData({ name: "", categoryId: "", price: "", discountedPrice: "", inStock: true, image: "" })
              setCurrentProduct(null)
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