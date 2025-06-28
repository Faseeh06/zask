"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Login from "./auth/login/page"
import Signup from "./auth/signup/page"
import ProjectSelection from "./project-selection/page"
import Dashboard from "./dashboard/page"
import { onAuthStateChange } from "../lib/auth"

type Page = "login" | "signup" | "project-selection" | "dashboard"

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("login")
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const [currentProject, setCurrentProject] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is already authenticated and has a current project
    const savedUser = localStorage.getItem('zask_current_user')
    const savedProject = localStorage.getItem('zask_current_project')
    
    if (savedUser) {
      setCurrentUser(savedUser)
      if (savedProject) {
        setCurrentProject(savedProject)
        setCurrentPage("dashboard")
      } else {
        setCurrentPage("project-selection")
      }
    }
  }, [])

  // Monitor authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      console.log('Auth state changed:', user ? 'User logged in' : 'User logged out', user)
      if (user) {
        setCurrentUser(user.email || user.uid)
        console.log('User details:', { email: user.email, uid: user.uid })
      } else {
        setCurrentUser(null)
        setCurrentProject(null)
      }
    })

    return () => unsubscribe()
  }, [])

  const handleLogin = (username: string) => {
    setCurrentUser(username)
    localStorage.setItem('zask_current_user', username)
    
    // Check if user has joined projects before
    const userProjects = localStorage.getItem(`zask_user_projects_${username}`)
    if (userProjects && JSON.parse(userProjects).length > 0) {
      setCurrentPage("project-selection")
    } else {
      setCurrentPage("project-selection")
    }
  }

  const handleProjectSelected = (projectName: string) => {
    setCurrentProject(projectName)
    localStorage.setItem('zask_current_project', projectName)
    setCurrentPage("dashboard")
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setCurrentProject(null)
    localStorage.removeItem('zask_current_user')
    localStorage.removeItem('zask_current_project')
    setCurrentPage("login")
  }

  const handleSwitchProject = () => {
    setCurrentProject(null)
    localStorage.removeItem('zask_current_project')
    setCurrentPage("project-selection")
  }

  if (currentPage === "login") {
    return <Login onLogin={handleLogin} onSwitchToSignup={() => setCurrentPage("signup")} />
  }

  if (currentPage === "signup") {
    return <Signup onSignup={handleLogin} onSwitchToLogin={() => setCurrentPage("login")} />
  }

  if (currentPage === "project-selection") {
    return (
      <ProjectSelection 
        onProjectSelected={handleProjectSelected}
        currentUser={currentUser}
        onLogout={handleLogout}
      />
    )
  }

  return (
    <Dashboard 
      onLogout={handleLogout}
      onSwitchProject={handleSwitchProject}
      currentProject={currentProject}
      currentUser={currentUser}
    />
  )
}
