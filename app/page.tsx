"use client"

import { useState } from "react"
import LoginPage from "./auth/login/page"
import SignupPage from "./auth/signup/page"
import Dashboard from "./dashboard/page"

export default function App() {
  const [currentPage, setCurrentPage] = useState<"login" | "signup" | "dashboard">("login")
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  const handleLogin = () => {
    setIsAuthenticated(true)
    setCurrentPage("dashboard")
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setCurrentPage("login")
  }

  if (currentPage === "login") {
    return <LoginPage onLogin={handleLogin} onSwitchToSignup={() => setCurrentPage("signup")} />
  }

  if (currentPage === "signup") {
    return <SignupPage onSignup={handleLogin} onSwitchToLogin={() => setCurrentPage("login")} />
  }

  return <Dashboard onLogout={handleLogout} />
}
