"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LGAWardSelector } from "@/components/lga-ward-selector"
import { toast } from "@/hooks/use-toast"
import { Edit, Search, Shield, UserCheck, UserX } from "lucide-react"

interface User {
  id: string
  name: string
  email: string
  role: "citizen" | "publisher" | "admin" | "super_admin"
  isActive: boolean
  createdAt: string
  lastLogin?: string
  projectsCount?: number
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")
  const [selectedLGA, setSelectedLGA] = useState<string | null>(null)
  const [selectedWard, setSelectedWard] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        const transformedUsers = (data.users || []).map((user: any) => ({
          id: user.id,
          name: user.full_name || user.name || "Unknown",
          email: user.email,
          role: user.role,
          isActive: user.is_active,
          createdAt: user.created_at,
          projectsCount: user.total_projects || 0
        }))
        setUsers(transformedUsers)
      }
    } catch (error) {
      console.error("Failed to fetch users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleUserAction = async (userId: string, action: "activate" | "deactivate" | "promote" | "demote") => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
      })

      if (response.ok) {
        toast({
          title: "User updated",
          description: `User has been ${action}d successfully.`,
        })
        fetchUsers()
        setSelectedUser(null)
      } else {
        throw new Error(`Failed to ${action} user`)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user. Please try again.`,
        variant: "destructive",
      })
    }
  }

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const updateData: any = { role: newRole }

      // Include LGA and ward data when promoting to publisher
      if (newRole === "publisher") {
        if (!selectedLGA) {
          toast({
            title: "LGA Required",
            description: "Please select an LGA for the publisher.",
            variant: "destructive",
          })
          return
        }
        updateData.lga_id = selectedLGA
        updateData.ward_id = selectedWard
      }

      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast({
          title: "Role updated",
          description: `User role has been updated to ${newRole.replace("_", " ")}.`,
        })
        fetchUsers()
        setSelectedUser(null)
        setSelectedRole("")
        setSelectedLGA(null)
        setSelectedWard(null)
      } else {
        throw new Error("Failed to update user role")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user role. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  if (loading) {
    return <div className="text-center py-8">Loading users...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="citizen">Citizens</SelectItem>
            <SelectItem value="publisher">Publishers</SelectItem>
            <SelectItem value="admin">Admins</SelectItem>
            <SelectItem value="super_admin">Super Admins</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Manage user accounts and permissions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Projects</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.role === "super_admin"
                            ? "destructive"
                            : user.role === "admin"
                              ? "default"
                              : user.role === "publisher"
                                ? "secondary"
                                : "outline"
                        }
                      >
                        {user.role.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.projectsCount || 0}</TableCell>
                    <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user)
                              setSelectedRole("")
                              setSelectedLGA(null)
                              setSelectedWard(null)
                            }}>
                            <Edit className="h-4 w-4 mr-2" />
                            Manage
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Manage User: {user.name}</DialogTitle>
                            <DialogDescription>Update user permissions and account status</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <strong>Email:</strong> {user.email}
                              </div>
                              <div>
                                <strong>Current Role:</strong> {user.role.replace("_", " ")}
                              </div>
                              <div>
                                <strong>Status:</strong> {user.isActive ? "Active" : "Inactive"}
                              </div>
                              <div>
                                <strong>Projects:</strong> {user.projectsCount || 0}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-sm font-medium">Update User Role</Label>
                              <RadioGroup
                                value={selectedRole || user.role}
                                onValueChange={(value) => {
                                  setSelectedRole(value)
                                  // Reset LGA/ward selections when not selecting publisher
                                  if (value !== "publisher") {
                                    setSelectedLGA(null)
                                    setSelectedWard(null)
                                  }
                                }}
                                className="grid grid-cols-2 gap-4"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="citizen" id="citizen" />
                                  <Label htmlFor="citizen" className="text-sm">Citizen</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="publisher" id="publisher" />
                                  <Label htmlFor="publisher" className="text-sm">Publisher</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="admin" id="admin" />
                                  <Label htmlFor="admin" className="text-sm">Admin</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem value="super_admin" id="super_admin" />
                                  <Label htmlFor="super_admin" className="text-sm">Super Admin</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            {(selectedRole === "publisher" || (user.role === "publisher" && !selectedRole)) && (
                              <div className="space-y-3">
                                <Label className="text-sm font-medium">Publisher Location</Label>
                                <p className="text-xs text-muted-foreground">
                                  Select the LGA and Ward where this publisher will be able to submit projects.
                                </p>
                                <LGAWardSelector
                                  onSelectionChange={(lgaId, wardId) => {
                                    setSelectedLGA(lgaId)
                                    setSelectedWard(wardId)
                                  }}
                                />
                              </div>
                            )}
                          </div>
                          <DialogFooter className="flex gap-2 flex-wrap">
                            <Button
                              variant="outline"
                              onClick={() => handleUserAction(user.id, user.isActive ? "deactivate" : "activate")}
                            >
                              {user.isActive ? (
                                <UserX className="h-4 w-4 mr-2" />
                              ) : (
                                <UserCheck className="h-4 w-4 mr-2" />
                              )}
                              {user.isActive ? "Deactivate" : "Activate"}
                            </Button>
                            {selectedRole && selectedRole !== user.role && (
                              <Button
                                onClick={() => handleRoleUpdate(user.id, selectedRole)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Shield className="h-4 w-4 mr-2" />
                                Update Role
                              </Button>
                            )}
                            {user.role === "citizen" && !selectedRole && (
                              <Button onClick={() => handleUserAction(user.id, "promote")}>
                                <Shield className="h-4 w-4 mr-2" />
                                Promote to Publisher
                              </Button>
                            )}
                            {user.role === "publisher" && !selectedRole && (
                              <Button variant="destructive" onClick={() => handleUserAction(user.id, "demote")}>
                                Demote to Citizen
                              </Button>
                            )}
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm break-words">{user.name}</h3>
                      <p className="text-xs text-muted-foreground break-words">{user.email}</p>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user)
                            setSelectedRole("")
                            setSelectedLGA(null)
                            setSelectedWard(null)
                          }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-md">
                        <DialogHeader>
                          <DialogTitle className="text-lg">Manage User: {user.name}</DialogTitle>
                          <DialogDescription>Update user permissions and account status</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Email:</strong> <span className="break-words">{user.email}</span>
                            </div>
                            <div>
                              <strong>Current Role:</strong> {user.role.replace("_", " ")}
                            </div>
                            <div>
                              <strong>Status:</strong> {user.isActive ? "Active" : "Inactive"}
                            </div>
                            <div>
                              <strong>Projects:</strong> {user.projectsCount || 0}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <Label className="text-sm font-medium">Update User Role</Label>
                            <RadioGroup
                              value={selectedRole || user.role}
                              onValueChange={(value) => {
                                setSelectedRole(value)
                                // Reset LGA/ward selections when not selecting publisher
                                if (value !== "publisher") {
                                  setSelectedLGA(null)
                                  setSelectedWard(null)
                                }
                              }}
                              className="grid grid-cols-2 gap-4"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="citizen" id="citizen" />
                                <Label htmlFor="citizen" className="text-sm">Citizen</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="publisher" id="publisher" />
                                <Label htmlFor="publisher" className="text-sm">Publisher</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="admin" id="admin" />
                                <Label htmlFor="admin" className="text-sm">Admin</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="super_admin" id="super_admin" />
                                <Label htmlFor="super_admin" className="text-sm">Super Admin</Label>
                              </div>
                            </RadioGroup>
                          </div>

                          {(selectedRole === "publisher" || (user.role === "publisher" && !selectedRole)) && (
                            <div className="space-y-3">
                              <Label className="text-sm font-medium">Publisher Location</Label>
                              <p className="text-xs text-muted-foreground">
                                Select the LGA and Ward where this publisher will be able to submit projects.
                              </p>
                              <LGAWardSelector
                                onSelectionChange={(lgaId, wardId) => {
                                  setSelectedLGA(lgaId)
                                  setSelectedWard(wardId)
                                }}
                              />
                            </div>
                          )}
                        </div>
                        <DialogFooter className="flex flex-col sm:flex-row gap-2">
                          <Button
                            variant="outline"
                            onClick={() => handleUserAction(user.id, user.isActive ? "deactivate" : "activate")}
                            className="w-full sm:w-auto"
                          >
                            {user.isActive ? (
                              <UserX className="h-4 w-4 mr-2" />
                            ) : (
                              <UserCheck className="h-4 w-4 mr-2" />
                            )}
                            {user.isActive ? "Deactivate" : "Activate"}
                          </Button>
                          {selectedRole && selectedRole !== user.role && (
                            <Button
                              onClick={() => handleRoleUpdate(user.id, selectedRole)}
                              className="w-full sm:w-auto bg-primary hover:bg-primary/90"
                            >
                              <Shield className="h-4 w-4 mr-2" />
                              Update Role
                            </Button>
                          )}
                          {user.role === "citizen" && !selectedRole && (
                            <Button onClick={() => handleUserAction(user.id, "promote")} className="w-full sm:w-auto">
                              <Shield className="h-4 w-4 mr-2" />
                              Promote to Publisher
                            </Button>
                          )}
                          {user.role === "publisher" && !selectedRole && (
                            <Button variant="destructive" onClick={() => handleUserAction(user.id, "demote")} className="w-full sm:w-auto">
                              Demote to Citizen
                            </Button>
                          )}
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge
                      variant={
                        user.role === "super_admin"
                          ? "destructive"
                          : user.role === "admin"
                            ? "default"
                            : user.role === "publisher"
                              ? "secondary"
                              : "outline"
                      }
                      className="text-xs"
                    >
                      {user.role.replace("_", " ")}
                    </Badge>
                    <Badge variant={user.isActive ? "default" : "secondary"} className="text-xs">
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>📊 Projects: {user.projectsCount || 0}</p>
                    <p>🕒 Last Login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {filteredUsers.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No users found matching your criteria.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
