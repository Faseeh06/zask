"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Plus, Users, ArrowRight, LogOut, Key } from "lucide-react"

interface ProjectSelectionProps {
  onProjectSelected: (projectName: string) => void
  currentUser: string | null
  onLogout: () => void
}

interface Project {
  id: string
  name: string
  code: string
  joinedAt: string
}

export default function ProjectSelection({ onProjectSelected, currentUser, onLogout }: ProjectSelectionProps) {
  const [projectCode, setProjectCode] = useState("")
  const [userProjects, setUserProjects] = useState<Project[]>([])
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (currentUser) {
      // Load user&apos;s projects from localStorage
      const savedProjects = localStorage.getItem(`zask_user_projects_${currentUser}`)
      if (savedProjects) {
        setUserProjects(JSON.parse(savedProjects))
      }
    }
  }, [currentUser])

  const handleJoinProject = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsJoining(true)
    setError("")

    // Simulate project validation - in real app this would call an API
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (projectCode.trim().length < 6) {
      setError("Project code must be at least 6 characters long")
      setIsJoining(false)
      return
    }

    // For demo purposes, let's say "ZASK01" is the default project code
    let projectName = "Zask"
    if (projectCode.toUpperCase() === "ZASK01") {
      projectName = "Zask"
    } else {
      // Create a project name based on the code
      projectName = `Project ${projectCode.slice(0, 6).toUpperCase()}`
    }

    // Check if user already joined this project
    const existingProject = userProjects.find(p => p.code === projectCode.toUpperCase())
    if (existingProject) {
      setError("You&apos;ve already joined this project")
      setIsJoining(false)
      return
    }

    // Add project to user&apos;s joined projects
    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: projectName,
      code: projectCode.toUpperCase(),
      joinedAt: new Date().toISOString()
    }

    const updatedProjects = [...userProjects, newProject]
    setUserProjects(updatedProjects)
    localStorage.setItem(`zask_user_projects_${currentUser}`, JSON.stringify(updatedProjects))

    setIsJoining(false)
    setProjectCode("")
    onProjectSelected(projectName)
  }

  const handleSelectProject = (project: Project) => {
    onProjectSelected(project.name)
  }

  return (
    <div className="min-h-screen bg-[#f5f8f3] flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl shadow-lg mb-4">
            <CheckSquare className="w-8 h-8 text-[#f5f8f3]" />
          </div>
          <h1 className="text-5xl font-bold text-black mb-2 font-ephesis">Zask</h1>
          <p className="text-gray-800 text-lg font-poiret-one">
            Welcome, {currentUser}! Select or join a project to continue
          </p>
        </div>

        <div className="grid gap-6">
          {/* Join New Project */}
          <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                <Plus className="w-6 h-6 text-black" />
                Join New Project
              </CardTitle>
              <CardDescription className="text-gray-700">
                Enter the project code provided by your team lead or project administrator
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinProject} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="projectCode" className="text-sm font-medium text-gray-800">
                    Project Code
                  </Label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
                    <Input
                      id="projectCode"
                      type="text"
                      placeholder="Enter project code (e.g., ZASK01)"
                      value={projectCode}
                      onChange={(e) => setProjectCode(e.target.value)}
                      className="pl-10 h-12 border-gray-300 focus:border-black focus:ring-black text-base uppercase"
                      required
                    />
                  </div>
                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isJoining}
                  className="w-full h-12 bg-black hover:bg-gray-800 text-[#f5f8f3] font-medium text-base shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isJoining ? "Joining..." : "Join Project"}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Previously Joined Projects */}
          {userProjects.length > 0 && (
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl font-bold text-black flex items-center gap-2">
                  <Users className="w-6 h-6 text-gray-700" />
                  Your Projects
                </CardTitle>
                <CardDescription className="text-gray-700">
                  Select from projects you&apos;ve previously joined
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center justify-between p-4 bg-gray-50/50 hover:bg-gray-100/70 rounded-lg border border-gray-300/50 cursor-pointer transition-all duration-200"
                      onClick={() => handleSelectProject(project)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center">
                          <CheckSquare className="w-5 h-5 text-[#f5f8f3]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-black">{project.name}</h3>
                          <p className="text-sm text-gray-600">
                            Joined {new Date(project.joinedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-gray-200 text-black border-gray-400">
                          {project.code}
                        </Badge>
                        <ArrowRight className="w-5 h-5 text-gray-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Demo Note */}
          <Card className="border-dashed border-2 border-gray-400 bg-gray-100/50">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="font-semibold text-black mb-2">Demo Mode</h3>
                <p className="text-sm text-gray-700 mb-3">
                  Try using the code <strong>ZASK01</strong> to join the default Zask project
                </p>
                <Badge variant="outline" className="border-gray-500 text-black">
                  ZASK01
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Logout Button */}
        <div className="mt-8 text-center">
          <Button 
            variant="ghost" 
            onClick={onLogout}
            className="text-gray-700 hover:text-black"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  )
} 