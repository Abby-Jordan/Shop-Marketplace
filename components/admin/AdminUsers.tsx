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
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, UserPlus, UserX } from "lucide-react"

// Mock users data
const mockUsers = Array.from({ length: 15 }).map((_, i) => ({
  id: `USR${1000 + i}`,
  name: `User ${i + 1}`,
  email: `user${i + 1}@example.com`,
  joinDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
  isAdmin: i === 0,
  status: Math.random() > 0.2 ? "Active" : "Inactive",
}))

export default function AdminUsers() {
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [openDialog, setOpenDialog] = useState(false)

  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    isAdmin: false,
  })

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleAddUser = () => {
    const id = `USR${Math.floor(1000 + Math.random() * 9000)}`
    const joinDate = new Date().toISOString().split("T")[0]

    const newUserData = {
      id,
      ...newUser,
      joinDate,
      status: "Active",
    }

    setUsers([newUserData, ...users])
    setNewUser({ name: "", email: "", isAdmin: false })
    setOpenDialog(false)
  }

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter((user) => user.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Search users..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
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
              <Button onClick={handleAddUser}>Add User</Button>
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
              <TableHead>Join Date</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.joinDate}</TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.isAdmin
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                        : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
                    }
                  >
                    {user.isAdmin ? "Admin" : "Customer"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    className={
                      user.status === "Active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                    }
                  >
                    {user.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {user.isAdmin ? (
                    <Badge className="text-xs text-gray-500 bg-transparent border border-gray-300">
                      Protected
                    </Badge>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(user.id)}>
                      <UserX className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
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
    </div>
  )
}
