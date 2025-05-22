'use client';

import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { GET_CATEGORIES } from '@/graphql/queries';
import { CREATE_CATEGORY, UPDATE_CATEGORY, DELETE_CATEGORY } from '@/graphql/mutation';
import CategoryForm from '@/components/admin/CategoryForm';
import Image from 'next/image';
import { CategoryFormData } from '@/lib/validations';

export default function CategoriesPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { data, loading, refetch } = useQuery(GET_CATEGORIES, {
    fetchPolicy: 'cache-and-network',
  });
  const [createCategory] = useMutation(CREATE_CATEGORY);
  const [updateCategory] = useMutation(UPDATE_CATEGORY);
  const [deleteCategory] = useMutation(DELETE_CATEGORY);

  const { toast } = useToast();

  const handleCreate = async (data: CategoryFormData, imageFile: File | null) => {
    setIsLoading(true);
    try {
      let imageUrl = null;

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetch('/api/category/image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'categoryId': data.name
          }
        });

        if (!response.ok) throw new Error('Image upload failed');
        const responseData = await response.json();
        imageUrl = responseData.imageUrl;
      }

      await createCategory({
        variables: {
          input: {
            name: data.name,
            description: data.description,
            image: imageUrl
          },
        },
      });

      toast({
        title: 'Category created successfully',
      });
      setIsCreateDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Failed to create category',
        description: error?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (data: CategoryFormData, imageFile: File | null) => {
    setIsLoading(true);
    try {
      let imageUrl = selectedCategory.image;

      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);

        const response = await fetch('/api/category/image', {
          method: 'POST',
          body: formData,
          credentials: 'include',
          headers: {
            'categoryId': data.name,
            'Old-Image-Url': selectedCategory.image || ''
          }
        });

        if (!response.ok) throw new Error('Image upload failed');
        const responseData = await response.json();
        imageUrl = responseData.imageUrl;
      }

      await updateCategory({
        variables: {
          id: selectedCategory.id,
          input: {
            name: data.name,
            description: data.description,
            image: imageUrl
          }
        },
      });

      toast({
        title: 'Category updated successfully',
      });
      setIsEditDialogOpen(false);
      refetch();
    } catch (error: any) {
      toast({
        title: 'Failed to update category',
        description: error?.message || 'Something went wrong',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
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
      } catch (error: any) {
        toast({
          title: 'Failed to delete category',
          description: error?.message || 'Something went wrong',
          variant: 'destructive',
        });
      }
    }
  };

  const handleEdit = (category: any) => {
    setSelectedCategory(category);
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Add Category</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <CategoryForm
              onSubmit={handleCreate}
              isLoading={isLoading}
              mode="create"
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.categories.map((category: any) => (
          <Card key={category.id} className="overflow-hidden">
            <div className="relative h-48 w-full">
              <Image
                src={category.image || '/default-category.jpg'}
                alt={category.name}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle>{category.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4 line-clamp-2">{category.description}</p>
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <CategoryForm
              onSubmit={handleUpdate}
              isLoading={isLoading}
              initialData={selectedCategory}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 