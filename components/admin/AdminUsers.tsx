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
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Search, UserPlus, UserX } from "lucide-react"
import { useQuery, useMutation } from '@apollo/client'
import { GET_USERS } from '../../graphql/queries'
import { UPDATE_USER_STATUS, DELETE_USER, ADD_USER } from '../../graphql/mutation'
import { User } from "@/types/user"
import { useToast } from "@/hooks/use-toast"
import UserForm from "./UserForm"
import type { UserFormData } from "@/lib/validations"

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-yellow-100 text-yellow-800',
  DEACTIVATED: 'bg-red-100 text-red-800',
}

export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const { data, loading, error, refetch } = useQuery(GET_USERS)
  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS)
  const [deleteUser] = useMutation(DELETE_USER)
  const [addUser] = useMutation(ADD_USER)

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus({
        variables: { id: userId, status: newStatus },
      })
      refetch()
      toast({
        title: "Status Updated",
        description: "User status has been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the user status.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await deleteUser({
        variables: { id: selectedUser.id },
      })
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
      })
      setIsDeleteDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "There was an error deleting the user.",
        variant: "destructive",
      })
    }
  }

  const handleAddUser = async (data: UserFormData) => {
    setIsLoading(true)
    try {
      await addUser({
        variables: {
          name: data.name,
          email: data.email,
          isAdmin: data.isAdmin,
        },
      })
      toast({
        title: "User Added",
        description: "The user has been added successfully.",
      })
      setIsAddDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({
        title: "Add Failed",
        description: error.message || "There was an error adding the user.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditUser = async (data: UserFormData) => {
    if (!selectedUser) return

    setIsLoading(true)
    try {
      await updateUserStatus({
        variables: {
          id: selectedUser.id,
          status: data.status,
        },
      })
      toast({
        title: "User Updated",
        description: "The user has been updated successfully.",
      })
      setIsEditDialogOpen(false)
      refetch()
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "There was an error updating the user.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const filteredUsers = data?.users?.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    )
  }

  if (error) return <div>Error: {error.message}</div>

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        <Button 
          onClick={() => setIsAddDialogOpen(true)} 
          className="bg-red-600 hover:bg-red-700"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Activity</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user: User) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>
                  {user.role !== 'ADMIN' ? (
                    <Badge className={statusColors[user.status as keyof typeof statusColors]}>
                      {user.status}
                    </Badge>
                  ) : '-'}
                </TableCell>
                <TableCell>
                  {user.role !== 'ADMIN' ? user.lastActivityAt
                    ? new Date(user.lastActivityAt).toLocaleDateString()
                    : 'Never'
                  : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    {user.role !== 'ADMIN' ? (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="secondary" size="sm" disabled>
                        Administrator
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  No users found
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
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Fill in the form below to add a new user.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSubmit={handleAddUser}
            isLoading={isLoading}
            mode="create"
          />
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-xl" onOpenAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Update the user information below.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <UserForm
              onSubmit={handleEditUser}
              isLoading={isLoading}
              initialData={{
                name: selectedUser.name,
                email: selectedUser.email,
                isAdmin: selectedUser.role === 'ADMIN',
                status: selectedUser.status as "ACTIVE" | "INACTIVE" | "DEACTIVATED"
              }}
              mode="edit"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
