"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Briefcase, Building, Loader2, User } from "lucide-react"
import { userService, type AppUser } from "@/lib/user-service"
import { User as FirebaseUser } from "firebase/auth"
import { toast } from "sonner"

interface ProfileCompletionModalProps {
  user: FirebaseUser
  isOpen: boolean
  onComplete: (success: boolean) => void
}

export default function ProfileCompletionModal({ user, isOpen, onComplete }: ProfileCompletionModalProps) {
  const [name, setName] = useState(user.displayName || '')
  const [role, setRole] = useState<AppUser['role']>('member')
  const [department, setDepartment] = useState('')
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)

  const handleCompleteProfile = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name")
      return
    }

    setIsCreatingProfile(true)

    try {
      const { success, error } = await userService.createUserProfile(user, {
        name: name.trim(),
        role: role,
        department: department.trim() || undefined
      })

      if (!success) {
        console.error('Failed to create user profile:', error)
        toast.error('Failed to complete profile setup. Please try again.')
        onComplete(false)
        return
      }

      toast.success('Profile completed successfully!')
      onComplete(true)
    } catch (error) {
      console.error('Profile completion error:', error)
      toast.error('Failed to complete profile setup. Please try again.')
      onComplete(false)
    } finally {
      setIsCreatingProfile(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={() => !isCreatingProfile && onComplete(false)}>
      <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Complete Your Profile
          </DialogTitle>
          <DialogDescription>
            Please provide your role and department information to complete your account setup.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Name Field */}
          <div className="space-y-2">
            <Label htmlFor="profileName" className="text-sm font-medium text-gray-800">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                id="profileName"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-black focus:ring-black"
                required
                disabled={isCreatingProfile}
              />
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="profileRole" className="text-sm font-medium text-gray-800">
              Role
            </Label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4 z-10" />
              <Select value={role} onValueChange={(value: AppUser['role']) => setRole(value)} disabled={isCreatingProfile}>
                <SelectTrigger className="pl-10 h-10 border-gray-300 focus:border-black focus:ring-black">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Team Member</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="designer">Designer</SelectItem>
                  <SelectItem value="analyst">Analyst</SelectItem>
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="project_manager">Project Manager</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Department Field */}
          <div className="space-y-2">
            <Label htmlFor="profileDepartment" className="text-sm font-medium text-gray-800">
              Department (Optional)
            </Label>
            <div className="relative">
              <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
              <Input
                id="profileDepartment"
                type="text"
                placeholder="e.g., Engineering, Marketing, Design"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="pl-10 h-10 border-gray-300 focus:border-black focus:ring-black"
                disabled={isCreatingProfile}
              />
            </div>
          </div>

          {/* Complete Profile Button */}
          <Button
            onClick={handleCompleteProfile}
            className="w-full h-10 bg-black hover:bg-gray-800 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
            disabled={isCreatingProfile}
          >
            {isCreatingProfile ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Setting up your profile...
              </>
            ) : (
              'Complete Profile'
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            This information helps us organize teams and assign appropriate permissions.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
} 