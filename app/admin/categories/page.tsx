'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { GET_CATEGORIES } from '@/graphql/queries';
import { CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } from '@/graphql/mutation';

export default function CategoriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
  });

  const { data, loading, refetch } = useQuery(GET_CATEGORIES);
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const { toast } = useToast()

  const handleCreate = async () => {
    try {
      await createCategory({
        variables: {
          input: formData,
        },
      });
      toast({
        title: 'Category created successfully',
      });
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', image: '' });
      refetch();
    } catch (error) {
      toast({
        title: 'Failed to create category',
      });
    }
  };

  const handleUpdate = async () => {
    try {
      await updateCategory({
        variables: {
          id: selectedCategory.id,
          input: {
            name: formData.name,
            description: formData.description,
            image: formData.image
          }
        },
      });
      toast({
        title: 'Category updated successfully',
      });
      setIsEditDialogOpen(false);
      setFormData({ name: '', description: '', image: '' });
      refetch();
    } catch (error) {
      toast({
        title: 'Failed to update category',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory({
          variables: { id },
        });
        toast({
          title: 'Category deleted successfully',
        });
        refetch();
      } catch (error) {
        toast({
          title: 'Failed to delete category',
        });
      }
    }
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      image: category.image,
    });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataFile = new FormData();
    formDataFile.append('file', file);

    try {

      const response = await fetch('/api/category/image', {
        method: 'POST',
        body: formDataFile,
        credentials: 'include',
        headers: {
          'categoryId': formData.name
        }
      });

      if (!response.ok) throw new Error('Upload failed');
      const data = await response.json();

      setFormData({ ...formData, image: data.imageUrl as string })
    //   setFormErrors({ ...formErrors, image: "" })

      toast({
        title: 'Product image updated successfully',
        description: 'Product image updated successfully',
      })
    } catch {
      toast({
        title: 'Failed to upload image',
        description: 'Failed to upload image',
      })
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {formData.image && <img src={formData.image} alt="Preview" className="h-20 mt-2 rounded" />}
              <Button onClick={handleCreate}>Create</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.categories.map((category: any) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <p className="text-gray-600 mb-4">{category.description}</p>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => handleEdit(category)}>
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => handleDelete(category.id)}>
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <Input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              {formData.image && <img src={formData.image} alt="Preview" className="h-20 mt-2 rounded" />}
            <Button onClick={handleUpdate}>Update</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 