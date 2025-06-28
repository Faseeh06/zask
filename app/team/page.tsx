"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  Users, 
  Search, 
  Filter, 
  Mail, 
  Phone, 
  Building, 
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MoreHorizontal
} from "lucide-react"
import { userService, type AppUser, getUserDisplayName, getRoleDisplayName } from "@/lib/user-service"
import { toast } from "sonner"

export default function TeamPage() {
  const [users, setUsers] = useState<AppUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AppUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")

  // Get unique departments for filter
  const departments = Array.from(new Set(users.filter(user => user.department).map(user => user.department)))

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter, statusFilter, departmentFilter])

  const loadUsers = async () => {
    setIsLoading(true)
    try {
      const { users: fetchedUsers, error } = await userService.getAllUsers()
      
      if (error) {
        toast.error(`Failed to load users: ${error}`)
        return
      }

      setUsers(fetchedUsers)
    } catch (error) {
      console.error('Error loading users:', error)
      toast.error('Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter)
    }

    // Department filter
    if (departmentFilter !== "all") {
      filtered = filtered.filter(user => user.department === departmentFilter)
    }

    setFilteredUsers(filtered)
  }

  const getStatusColor = (status: AppUser['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'away':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'busy':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: AppUser['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />
      case 'away':
        return <Clock className="w-4 h-4" />
      case 'busy':
        return <AlertCircle className="w-4 h-4" />
      case 'inactive':
        return <XCircle className="w-4 h-4" />
      default:
        return <XCircle className="w-4 h-4" />
    }
  }

  const getRoleColor = (role: AppUser['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'project_manager':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'team_lead':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200'
      case 'developer':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'designer':
        return 'bg-pink-100 text-pink-800 border-pink-200'
      case 'analyst':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Never'
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString()
    } catch {
      return 'Unknown'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Users className="mr-3 h-8 w-8" />
              Team Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and their roles
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-sm">
              {filteredUsers.length} of {users.length} members
            </Badge>
            <Button onClick={loadUsers} variant="outline">
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="search"
                    placeholder="Search by name, email, or department"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Role Filter */}
              <div className="space-y-2">
                <Label>Role</Label>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All roles" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="project_manager">Project Manager</SelectItem>
                    <SelectItem value="team_lead">Team Lead</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                    <SelectItem value="designer">Designer</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="member">Team Member</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="away">Away</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Department Filter */}
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map(dept => (
                      <SelectItem key={dept} value={dept!}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.profileImage} />
                      <AvatarFallback className="bg-gray-200 text-gray-700 font-semibold">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{getUserDisplayName(user)}</h3>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <Button size="sm" variant="ghost">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Role and Status */}
                <div className="flex items-center justify-between">
                  <Badge className={getRoleColor(user.role)}>
                    {getRoleDisplayName(user.role)}
                  </Badge>
                  <Badge className={getStatusColor(user.status)}>
                    {getStatusIcon(user.status)}
                    <span className="ml-1 capitalize">{user.status}</span>
                  </Badge>
                </div>

                {/* Department */}
                {user.department && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Building className="w-4 h-4 mr-2" />
                    {user.department}
                  </div>
                )}

                {/* Phone */}
                {user.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2" />
                    {user.phone}
                  </div>
                )}

                {/* Assigned Tasks */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Assigned Tasks:</span>
                  <Badge variant="outline">
                    {user.assignedTasks.length}
                  </Badge>
                </div>

                {/* Assigned Projects */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Assigned Projects:</span>
                  <Badge variant="outline">
                    {user.assignedProjects.length}
                  </Badge>
                </div>

                {/* Member Since */}
                <div className="flex items-center text-sm text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Member since {formatDate(user.createdAt)}
                </div>

                {/* Last Active */}
                {user.lastActive && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Last active {formatDate(user.lastActive)}
                  </div>
                )}

                {/* Permissions */}
                <div className="pt-2 border-t">
                  <p className="text-xs font-medium text-gray-700 mb-2">Permissions:</p>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.canCreateProjects && (
                      <Badge variant="secondary" className="text-xs">Create Projects</Badge>
                    )}
                    {user.permissions.canAssignTasks && (
                      <Badge variant="secondary" className="text-xs">Assign Tasks</Badge>
                    )}
                    {user.permissions.canManageUsers && (
                      <Badge variant="secondary" className="text-xs">Manage Users</Badge>
                    )}
                    {user.permissions.canViewReports && (
                      <Badge variant="secondary" className="text-xs">View Reports</Badge>
                    )}
                    {user.permissions.canManageBudget && (
                      <Badge variant="secondary" className="text-xs">Manage Budget</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No team members found</h3>
              <p className="text-gray-600">
                {users.length === 0 
                  ? "No team members have been added yet." 
                  : "Try adjusting your filters to see more results."
                }
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 