"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CheckSquare, Eye, EyeOff, Mail, Lock, User, Loader2, Briefcase, Building } from "lucide-react"
import { signUp, signInWithGoogle } from "@/lib/auth"
import { userService, type AppUser } from "@/lib/user-service"
import ProfileCompletionModal from "@/components/ProfileCompletionModal"
import { User as FirebaseUser } from "firebase/auth"
import { toast } from "sonner"

interface SignupPageProps {
  onSignup: (username: string) => void
  onSwitchToLogin: () => void
}

export default function SignupPage({ onSignup, onSwitchToLogin }: SignupPageProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [role, setRole] = useState<AppUser['role']>('member')
  const [department, setDepartment] = useState("")
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null)
  const [showProfileCompletion, setShowProfileCompletion] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Basic validation
    if (password !== confirmPassword) {
      toast.error("Passwords don't match")
      return
    }
    
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }
    
    if (!agreeTerms) {
      toast.error("Please agree to the terms and conditions")
      return
    }

    if (!fullName.trim()) {
      toast.error("Please enter your full name")
      return
    }

    setIsLoading(true)

    try {
      // Step 1: Create Firebase Auth account
      const { user, error } = await signUp(email, password)
      
      if (error) {
        toast.error(error)
        setIsLoading(false)
        return
      }

      if (user) {
        // Step 2: Create user profile in Firestore
        const { success, error: profileError } = await userService.createUserProfile(user, {
          name: fullName.trim(),
          role: role,
          department: department.trim() || undefined
        })

        if (!success) {
          console.error('Failed to create user profile:', profileError)
          toast.error('Account created but profile setup failed. Please contact support.')
          setIsLoading(false)
          return
        }

        // Use full name as display name
        const username = fullName.trim()
        
        // Store user info in localStorage
        localStorage.setItem('zask_user', username)
        
        toast.success('Account created successfully!')
        onSignup(username)
      }
    } catch (error) {
      toast.error('Signup failed. Please try again.')
      console.error('Signup error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    try {
      const { user, error } = await signInWithGoogle()
      
      if (error) {
        toast.error(error)
        setIsLoading(false)
        return
      }

      if (user) {
        // Check if user profile already exists
        const { user: existingProfile } = await userService.getUserProfile(user.uid)
        
        if (!existingProfile) {
          // Show profile completion modal for new Google users
          setGoogleUser(user)
          setShowProfileCompletion(true)
          setIsLoading(false)
        } else {
          // User already has a profile, proceed with login
          const username = user.displayName || user.email?.split('@')[0] || 'User'
          localStorage.setItem('zask_user', username)
          toast.success('Welcome back!')
          onSignup(username)
          setIsLoading(false)
        }
      }
    } catch (error) {
      toast.error('Google signup failed. Please try again.')
      console.error('Google signup error:', error)
      setIsLoading(false)
    }
  }

  const handleProfileCompletion = (success: boolean) => {
    setShowProfileCompletion(false)
    
    if (success && googleUser) {
      const username = googleUser.displayName || googleUser.email?.split('@')[0] || 'User'
      localStorage.setItem('zask_user', username)
      toast.success('Account created successfully!')
      onSignup(username)
    }
    
    setGoogleUser(null)
  }

  return (
    <div className="min-h-screen bg-[#f5f8f3] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl shadow-lg mb-4">
            <CheckSquare className="w-8 h-8 text-[#f5f8f3]" />
          </div>
          <h1 className="text-5xl font-bold text-black mb-2 font-ephesis">Zask</h1>
          <p className="text-gray-800 text-lg font-poiret-one">Smart Task Management Platform</p>
        </div>

        {/* Signup Card */}
        <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-4xl font-bold text-center text-black font-ephesis">Create Account</CardTitle>
            <CardDescription className="text-center text-gray-700 text-base font-poiret-one">
              Join Zask and start managing your projects efficiently
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name Field */}
              <div className="space-y-2">
                <Label htmlFor="fullName" className="text-sm font-medium text-gray-800">
                  Full Name
                </Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-800">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black text-base"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-gray-800">
                  Role
                </Label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 z-10" />
                  <Select value={role} onValueChange={(value: AppUser['role']) => setRole(value)} disabled={isLoading}>
                    <SelectTrigger className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black text-base">
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
                <Label htmlFor="department" className="text-sm font-medium text-gray-800">
                  Department (Optional)
                </Label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    id="department"
                    type="text"
                    placeholder="e.g., Engineering, Marketing, Design"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black text-base"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-800">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-black focus:ring-black text-base"
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-800">
                  Confirm Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-10 h-12 border-gray-300 focus:border-black focus:ring-black text-base"
                    required
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    disabled={isLoading}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {/* Password Match Indicator */}
                {confirmPassword && (
                  <p className={`text-xs ${password === confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                    {password === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreeTerms}
                  onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                  className="mt-1"
                  disabled={isLoading}
                />
                <Label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed">
                  I agree to the{" "}
                  <Button variant="link" className="text-black hover:text-gray-700 p-0 h-auto" disabled={isLoading}>
                    Terms of Service
                  </Button>{" "}
                  and{" "}
                  <Button variant="link" className="text-black hover:text-gray-700 p-0 h-auto" disabled={isLoading}>
                    Privacy Policy
                  </Button>
                </Label>
              </div>

              {/* Signup Button */}
              <Button
                type="submit"
                className="w-full h-12 bg-black hover:bg-gray-800 text-[#f5f8f3] font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-600">Or sign up with</span>
              </div>
            </div>

            {/* Social Signup */}
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-12 border-gray-300 hover:bg-[#f5f8f3] bg-transparent" 
                disabled={isLoading}
                onClick={handleGoogleSignUp}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button variant="outline" className="h-12 border-gray-300 hover:bg-[#f5f8f3] bg-transparent" disabled={isLoading}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </Button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <span className="text-gray-700">Already have an account? </span>
              <Button
                variant="link"
                onClick={onSwitchToLogin}
                className="text-black hover:text-gray-700 font-medium p-0"
                disabled={isLoading}
              >
                Sign in here
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-gray-600 text-sm font-poiret-one">
          <p>© 2024 Zask. Streamlining project management worldwide.</p>
        </div>
      </div>

      {/* Profile Completion Modal for Google OAuth users */}
      {googleUser && (
        <ProfileCompletionModal
          user={googleUser}
          isOpen={showProfileCompletion}
          onComplete={handleProfileCompletion}
        />
      )}
    </div>
  )
}
