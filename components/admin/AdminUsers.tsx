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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, UserPlus, UserX } from "lucide-react"
import { useQuery, useMutation } from '@apollo/client'
import { GET_USERS } from '../../graphql/queries'
import { UPDATE_USER_STATUS, DELETE_USER, ADD_USER } from '../../graphql/mutation'
import { User } from "@/types/user"
import { useToast } from "@/hooks/use-toast"
import { UserStatus } from "../../graphql/graphql-types"

const statusColors = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-yellow-100 text-yellow-800',
  DEACTIVATED: 'bg-red-100 text-red-800',
}


export default function AdminUsers() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [openDialog, setOpenDialog] = useState(false)
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    isAdmin: false,
  })
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    isAdmin: '',
  })
  const { toast } = useToast()

  const resetForm = () => {
    setNewUser({
      name: '',
      email: '',
      isAdmin: false,
    })
    setFormErrors({
      name: '',
      email: '',
      isAdmin: '',
    })
  }

  const { data, loading, error, refetch } = useQuery(GET_USERS)
  const [updateUserStatus] = useMutation(UPDATE_USER_STATUS)
  const [deleteUser] = useMutation(DELETE_USER, {
    onCompleted: () => {
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
      })
      refetch()
      setIsDeleteDialogOpen(false)
    },
    onError: (error) => {
      console.error('Error deleting user:', error)
      toast({
        title: "Error Deleting User",
        description: error.message || "There was an error deleting the user. Please try again.",
      })
    },
  })

  const [addUser, { loading: addUserLoading }] = useMutation(ADD_USER, {
    onCompleted: () => {
      toast({
        title: "User Added",
        description: "The user has been added successfully.",
      })
      refetch()
      setOpenDialog(false)
      resetForm()
    },
    onError: (error) => {
      console.error('Error adding user:', error)
      toast({
        title: "Error Adding User",
        description: error.message || "There was an error adding the user. Please try again.",
        variant: "destructive",
      })
    },
  })

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      await updateUserStatus({
        variables: { id: userId, status: newStatus },
      })
      refetch()
    } catch (error) {
      console.error('Error updating user status:', error)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return

    try {
      await deleteUser({
        variables: { id: selectedUser.id },
      })
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error Deleting User",
        description: error.message || "There was an error deleting the user. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAddUser = async () => {
    console.log(newUser)
    try {
      await addUser({
        variables: {
          name: newUser.name,
          email: newUser.email,
          isAdmin: newUser.isAdmin,
        },
      })
      setOpenDialog(false)
      refetch()
    } catch (error) {
      console.error('Error adding user:', error)
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

  console.log(filteredUsers)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
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

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700" disabled={addUserLoading}>
              <UserPlus className="h-4 w-4 mr-2" />
              {addUserLoading ? "Adding..." : "Add User"}
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                />
              </div>

              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isAdmin"
                  checked={newUser.isAdmin}
                  onCheckedChange={(checked) =>
                    setNewUser({ ...newUser, isAdmin: checked === true })
                  }
                />
                <Label htmlFor="isAdmin">Is Admin</Label>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleAddUser} disabled={addUserLoading}>
                {addUserLoading ? "Adding..." : "Add User"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
                        <select
                          value={user.status}
                          onChange={(e) => handleStatusChange(user.id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value={UserStatus.Active}>Active</option>
                          <option value={UserStatus.Inactive}>Inactive</option>
                          <option value={UserStatus.Deactivated}>Deactivated</option>
                        </select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          Delete
                        </Button>
                      </>
                    ) : <Button variant="secondary" size="sm" disabled>
                      Administrator
                    </Button>}
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
