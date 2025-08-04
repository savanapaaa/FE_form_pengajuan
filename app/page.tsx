"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Eye,
  EyeOff,
  Lock,
  User,
  ArrowLeft,
  Shield,
  AlertCircle,
  CheckCircle,
  Loader2,
  Smartphone,
  Monitor,
  Crown,
  Sparkles,
  Zap,
  Globe,
  Settings,
  Mail,
  UserPlus,
  LogIn,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useMobile } from "@/hooks/use-mobile"

// Animated background particles
const BackgroundParticles = () => {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 25 + 15,
  }))

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute bg-blue-400/20 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -80, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}

// Floating gradient orbs
const FloatingOrb = ({
  delay = 0,
  duration = 25,
  size = "w-64 h-64",
  color = "bg-gradient-to-r from-blue-400/30 to-indigo-400/30",
  position = "top-0 left-0",
}) => (
  <motion.div
    className={cn("absolute rounded-full blur-3xl", size, color, position)}
    animate={{
      x: [0, 80, -40, 0],
      y: [0, -80, 40, 0],
      scale: [1, 1.1, 0.9, 1],
      rotate: [0, 90, 180, 360],
    }}
    transition={{
      duration,
      repeat: Number.POSITIVE_INFINITY,
      delay,
      ease: "easeInOut",
    }}
  />
)

// Feature highlights component
const FeatureHighlights = () => {
  const features = [
    { icon: Shield, text: "Keamanan Tingkat Enterprise", color: "text-blue-600" },
    { icon: Zap, text: "Performa Optimal", color: "text-emerald-600" },
    { icon: Globe, text: "Akses Multi-Platform", color: "text-indigo-600" },
    { icon: Settings, text: "Kontrol Penuh", color: "text-slate-600" },
  ]

  return (
    <div className="grid grid-cols-2 gap-4">
      {features.map((feature, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 + index * 0.1 }}
          className="flex items-center space-x-3 p-3 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/50 shadow-sm"
        >
          <feature.icon className={cn("h-5 w-5", feature.color)} />
          <span className="text-sm font-medium text-slate-700">{feature.text}</span>
        </motion.div>
      ))}
    </div>
  )
}

// Mobile version of the login/register page
const MobileAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = localStorage.getItem("adminLoggedIn")
      const adminUser = localStorage.getItem("adminUser")

      if (isLoggedIn === "true" && adminUser) {
        try {
          const userData = JSON.parse(adminUser)
          // Check if remember me was enabled or if session is still valid
          if (userData.rememberMe || userData.loginTime) {
            const loginTime = new Date(userData.loginTime)
            const now = new Date()
            const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

            // If remember me is enabled, session lasts 30 days, otherwise 24 hours
            const sessionDuration = userData.rememberMe ? 24 * 30 : 24

            if (hoursDiff < sessionDuration) {
              router.push("/dashboard/admin")
              return
            }
          }
        } catch (error) {
          console.error("Error parsing admin user data:", error)
        }
      }

      // Clear invalid session
      localStorage.removeItem("adminLoggedIn")
      localStorage.removeItem("adminUser")
    }

    checkAuthStatus()
  }, [router])

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username harus diisi")
      return false
    }

    if (!password.trim()) {
      setError("Password harus diisi")
      return false
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        setError("Nama lengkap harus diisi")
        return false
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Email tidak valid")
        return false
      }
      if (password.length < 6) {
        setError("Password minimal 6 karakter")
        return false
      }
      if (password !== confirmPassword) {
        setError("Konfirmasi password tidak cocok")
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (isLogin) {
        // Login logic - check against demo credentials and registered users
        const existingUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]")
        let loginSuccess = false
        let userData = null

        // Check demo credentials
        if (username === "admin" && password === "admin123") {
          loginSuccess = true
          userData = {
            id: "demo-admin",
            username: "admin",
            fullName: "Administrator",
            email: "admin@demo.com",
            role: "administrator",
            loginTime: new Date().toISOString(),
            rememberMe,
          }
        } else {
          // Check registered users
          const user = existingUsers.find((u: any) => u.username === username && u.password === password)
          if (user) {
            loginSuccess = true
            userData = {
              ...user,
              loginTime: new Date().toISOString(),
              rememberMe,
            }
          }
        }

        if (loginSuccess && userData) {
          // Set authentication state
          localStorage.setItem("adminLoggedIn", "true")
          localStorage.setItem("adminUser", JSON.stringify(userData))

          setSuccess(true)
          setTimeout(() => {
            router.push("/dashboard/admin")
          }, 1000)
        } else {
          setError("Username atau password salah")
        }
      } else {
        // Registration logic
        const existingUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]")

        // Check if username or email already exists
        if (existingUsers.some((user: any) => user.username === username)) {
          setError("Username sudah digunakan")
        } else if (existingUsers.some((user: any) => user.email === email)) {
          setError("Email sudah terdaftar")
        } else {
          // Save new user
          const newUser = {
            id: Date.now().toString(),
            username,
            email,
            fullName,
            password, // In real app, this should be hashed
            role: "admin",
            createdAt: new Date().toISOString(),
          }

          existingUsers.push(newUser)
          localStorage.setItem("adminUsers", JSON.stringify(existingUsers))

          setSuccess(true)
          setTimeout(() => {
            setIsLogin(true)
            resetForm()
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setError("Terjadi kesalahan sistem. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setUsername("")
    setEmail("")
    setFullName("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess(false)
    setRememberMe(false)
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    resetForm()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background */}
      <BackgroundParticles />
      <FloatingOrb
        delay={0}
        size="w-32 h-32"
        color="bg-gradient-to-r from-blue-400/20 to-indigo-400/20"
        position="-top-16 -left-16"
      />
      <FloatingOrb
        delay={8}
        size="w-24 h-24"
        color="bg-gradient-to-r from-indigo-400/20 to-purple-400/20"
        position="top-1/4 -right-12"
      />
      <FloatingOrb
        delay={16}
        size="w-40 h-40"
        color="bg-gradient-to-r from-emerald-400/20 to-blue-400/20"
        position="-bottom-20 -left-20"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-4 flex items-center justify-between"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/")}
            className="text-slate-600 hover:text-slate-800 hover:bg-white/50 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Beranda
          </Button>
          <div className="flex items-center space-x-2 text-slate-600">
            <Smartphone className="h-4 w-4" />
            <span className="text-sm font-medium">Mobile</span>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="w-full max-w-sm"
          >
            <Card className="backdrop-blur-xl bg-white/90 border-slate-200/50 shadow-xl">
              <CardHeader className="text-center pb-4">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="mx-auto mb-4 p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-lg relative"
                >
                  {isLogin ? <Crown className="h-8 w-8 text-white" /> : <UserPlus className="h-8 w-8 text-white" />}
                  <motion.div
                    className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  />
                </motion.div>
                <CardTitle className="text-2xl font-bold text-slate-800">
                  {isLogin ? "Admin Portal" : "Daftar Admin"}
                </CardTitle>
                <CardDescription className="text-slate-600">
                  {isLogin ? "Masuk ke dashboard administrator" : "Buat akun administrator baru"}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Mode Toggle */}
                <div className="flex bg-slate-100 rounded-lg p-1">
                  <Button
                    type="button"
                    variant={isLogin ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsLogin(true)}
                    className={cn(
                      "flex-1 text-sm",
                      isLogin
                        ? "bg-white text-slate-800 hover:bg-white/90 shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50",
                    )}
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Masuk
                  </Button>
                  <Button
                    type="button"
                    variant={!isLogin ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setIsLogin(false)}
                    className={cn(
                      "flex-1 text-sm",
                      !isLogin
                        ? "bg-white text-slate-800 hover:bg-white/90 shadow-sm"
                        : "text-slate-600 hover:text-slate-800 hover:bg-white/50",
                    )}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Daftar
                  </Button>
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Alert className="border-red-200 bg-red-50">
                        <AlertCircle className="h-4 w-4 text-red-600" />
                        <AlertDescription className="text-red-700 text-sm">{error}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  {success && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Alert className="border-emerald-200 bg-emerald-50">
                        <CheckCircle className="h-4 w-4 text-emerald-600" />
                        <AlertDescription className="text-emerald-700 text-sm">
                          {isLogin
                            ? "Login berhasil! Mengalihkan ke dashboard..."
                            : "Pendaftaran berhasil! Silakan login dengan akun baru Anda."}
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <AnimatePresence mode="wait">
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-5"
                      >
                        <div className="space-y-2">
                          <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                            Nama Lengkap
                          </Label>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              id="fullName"
                              type="text"
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              className="pl-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200"
                              placeholder="Masukkan nama lengkap"
                              required={!isLogin}
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                            Email
                          </Label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                              id="email"
                              type="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="pl-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200"
                              placeholder="Masukkan email"
                              required={!isLogin}
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                      Username
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="pl-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="Masukkan username"
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                      Password
                    </Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200"
                        placeholder="Masukkan password"
                        required
                        disabled={isLoading}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-slate-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-slate-400" />
                        )}
                      </Button>
                    </div>
                  </motion.div>

                  <AnimatePresence>
                    {!isLogin && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-2"
                      >
                        <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                          Konfirmasi Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 pr-10 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200"
                            placeholder="Konfirmasi password"
                            required={!isLogin}
                            disabled={isLoading}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-slate-100"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            disabled={isLoading}
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-4 w-4 text-slate-400" />
                            ) : (
                              <Eye className="h-4 w-4 text-slate-400" />
                            )}
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {isLogin && (
                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center space-x-2"
                    >
                      <Checkbox
                        id="remember"
                        checked={rememberMe}
                        onCheckedChange={(checked) => setRememberMe(!!checked)}
                        className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                      />
                      <Label htmlFor="remember" className="text-sm text-slate-600">
                        Ingat saya
                      </Label>
                    </motion.div>
                  )}

                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                  >
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 h-12 relative overflow-hidden"
                      disabled={isLoading}
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        animate={{ x: [-100, 300] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      />
                      {isLoading ? (
                        <div className="flex items-center space-x-2 relative z-10">
                          <Loader2 className="h-5 w-5 animate-spin" />
                          <span>{isLogin ? "Memproses..." : "Mendaftar..."}</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 relative z-10">
                          {isLogin ? (
                            <>
                              <Shield className="h-5 w-5" />
                              <span>Masuk ke Dashboard</span>
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-5 w-5" />
                              <span>Daftar Sekarang</span>
                            </>
                          )}
                        </div>
                      )}
                    </Button>
                  </motion.div>
                </form>

                {/* Demo Credentials - Only show for login */}
                {isLogin && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-center"
                  >
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-center space-x-2 mb-2">
                        <Sparkles className="h-4 w-4 text-blue-600" />
                        <p className="text-sm font-semibold text-blue-800">Demo Login</p>
                      </div>
                      <div className="text-xs text-blue-700 space-y-1">
                        <p>
                          <span className="font-medium">Username:</span> admin
                        </p>
                        <p>
                          <span className="font-medium">Password:</span> admin123
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

// Desktop version of the login/register page
const DesktopAuthPage = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [fullName, setFullName] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Check if already logged in
  useEffect(() => {
    const checkAuthStatus = () => {
      const isLoggedIn = localStorage.getItem("adminLoggedIn")
      const adminUser = localStorage.getItem("adminUser")

      if (isLoggedIn === "true" && adminUser) {
        try {
          const userData = JSON.parse(adminUser)
          // Check if remember me was enabled or if session is still valid
          if (userData.rememberMe || userData.loginTime) {
            const loginTime = new Date(userData.loginTime)
            const now = new Date()
            const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60)

            // If remember me is enabled, session lasts 30 days, otherwise 24 hours
            const sessionDuration = userData.rememberMe ? 24 * 30 : 24

            if (hoursDiff < sessionDuration) {
              router.push("/dashboard/admin")
              return
            }
          }
        } catch (error) {
          console.error("Error parsing admin user data:", error)
        }
      }

      // Clear invalid session
      localStorage.removeItem("adminLoggedIn")
      localStorage.removeItem("adminUser")
    }

    checkAuthStatus()
  }, [router])

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username harus diisi")
      return false
    }

    if (!password.trim()) {
      setError("Password harus diisi")
      return false
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        setError("Nama lengkap harus diisi")
        return false
      }
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError("Email tidak valid")
        return false
      }
      if (password.length < 6) {
        setError("Password minimal 6 karakter")
        return false
      }
      if (password !== confirmPassword) {
        setError("Konfirmasi password tidak cocok")
        return false
      }
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (!validateForm()) {
      setIsLoading(false)
      return
    }

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (isLogin) {
        // Login logic - check against demo credentials and registered users
        const existingUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]")
        let loginSuccess = false
        let userData = null

        // Check demo credentials
        if (username === "admin" && password === "admin123") {
          loginSuccess = true
          userData = {
            id: "demo-admin",
            username: "admin",
            fullName: "Administrator",
            email: "admin@demo.com",
            role: "administrator",
            loginTime: new Date().toISOString(),
            rememberMe,
          }
        } else {
          // Check registered users
          const user = existingUsers.find((u: any) => u.username === username && u.password === password)
          if (user) {
            loginSuccess = true
            userData = {
              ...user,
              loginTime: new Date().toISOString(),
              rememberMe,
            }
          }
        }

        if (loginSuccess && userData) {
          // Set authentication state
          localStorage.setItem("adminLoggedIn", "true")
          localStorage.setItem("adminUser", JSON.stringify(userData))

          setSuccess(true)
          setTimeout(() => {
            router.push("/dashboard/admin")
          }, 1000)
        } else {
          setError("Username atau password salah")
        }
      } else {
        // Registration logic
        const existingUsers = JSON.parse(localStorage.getItem("adminUsers") || "[]")

        // Check if username or email already exists
        if (existingUsers.some((user: any) => user.username === username)) {
          setError("Username sudah digunakan")
        } else if (existingUsers.some((user: any) => user.email === email)) {
          setError("Email sudah terdaftar")
        } else {
          // Save new user
          const newUser = {
            id: Date.now().toString(),
            username,
            email,
            fullName,
            password, // In real app, this should be hashed
            role: "admin",
            createdAt: new Date().toISOString(),
          }

          existingUsers.push(newUser)
          localStorage.setItem("adminUsers", JSON.stringify(existingUsers))

          setSuccess(true)
          setTimeout(() => {
            setIsLogin(true)
            resetForm()
          }, 2000)
        }
      }
    } catch (error) {
      console.error("Authentication error:", error)
      setError("Terjadi kesalahan sistem. Silakan coba lagi.")
    } finally {
      setIsLoading(false)
    }
  }

  const resetForm = () => {
    setUsername("")
    setEmail("")
    setFullName("")
    setPassword("")
    setConfirmPassword("")
    setError("")
    setSuccess(false)
    setRememberMe(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <BackgroundParticles />
      <FloatingOrb
        delay={0}
        size="w-96 h-96"
        color="bg-gradient-to-r from-blue-400/20 to-indigo-400/20"
        position="-top-48 -left-48"
      />
      <FloatingOrb
        delay={10}
        size="w-80 h-80"
        color="bg-gradient-to-r from-indigo-400/20 to-purple-400/20"
        position="top-1/4 -right-40"
      />
      <FloatingOrb
        delay={20}
        size="w-64 h-64"
        color="bg-gradient-to-r from-emerald-400/20 to-blue-400/20"
        position="-bottom-32 left-1/4"
      />

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="p-6 flex items-center justify-between"
        >

          <div className="flex items-center space-x-2 text-slate-600">
            <Monitor className="h-5 w-5" />
            <span className="font-medium">Desktop</span>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className= "min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-blue-50 to-purple-50">
            {/* Left Side - Branding */}
            {/* <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col justify-center space-y-8"
            >
              <div className="space-y-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl flex items-center justify-center shadow-xl relative"
                >
                  {isLogin ? <Crown className="h-12 w-12 text-white" /> : <UserPlus className="h-12 w-12 text-white" />}
                  <motion.div
                    className="absolute -top-2 -right-2 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                  >
                    <Sparkles className="h-3 w-3 text-emerald-800" />
                  </motion.div>
                </motion.div>

                <div className="space-y-6">
                  <motion.h1
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-5xl lg:text-6xl font-bold text-slate-800 leading-tight"
                  >
                    Admin
                    <br />
                    <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      {isLogin ? "Dashboard" : "Registration"}
                    </span>
                  </motion.h1>
                  <motion.p
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xl text-slate-600 leading-relaxed max-w-lg"
                  >
                    {isLogin
                      ? "Kelola sistem pengajuan konten dengan teknologi terdepan. Dashboard admin yang powerful untuk kontrol penuh atas platform Anda."
                      : "Bergabunglah dengan tim administrator. Daftarkan akun Anda untuk mendapatkan akses ke dashboard admin yang powerful."}
                  </motion.p>
                </div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }}>
                  <FeatureHighlights />
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="flex items-center space-x-6 text-sm text-slate-500"
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                    <span>Sistem Online</span>
                  </div>
                  <div className="w-px h-4 bg-slate-300" />
                  <span>Secure SSL</span>
                  <div className="w-px h-4 bg-slate-300" />
                  <span>24/7 Monitoring</span>
                </motion.div>
              </div>
            </motion.div>  */}

            {/* Right Side - Auth Form */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-center"
            >
              <Card className="w-full max-w-md backdrop-blur-xl bg-white/90 border-slate-200/50 shadow-xl">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-3xl font-bold text-slate-800">
                    {isLogin ? "Masuk ke Admin" : "Daftar Admin"}
                  </CardTitle>
                  <CardDescription className="text-slate-600 text-lg">
                    {isLogin
                      ? "Silakan masukkan kredensial administrator Anda"
                      : "Buat akun administrator baru untuk mengakses dashboard"}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Mode Toggle */}
                  <div className="flex bg-slate-100 rounded-lg p-1">
                    <Button
                      type="button"
                      variant={isLogin ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setIsLogin(true)}
                      className={cn(
                        "flex-1",
                        isLogin
                          ? "bg-white text-slate-800 hover:bg-white/90 shadow-sm"
                          : "text-slate-600 hover:text-slate-800 hover:bg-white/50",
                      )}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      Masuk
                    </Button>
                    <Button
                      type="button"
                      variant={!isLogin ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setIsLogin(false)}
                      className={cn(
                        "flex-1",
                        !isLogin
                          ? "bg-white text-slate-800 hover:bg-white/90 shadow-sm"
                          : "text-slate-600 hover:text-slate-800 hover:bg-white/50",
                      )}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Daftar
                    </Button>
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Alert className="border-red-200 bg-red-50">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <AlertDescription className="text-red-700">{error}</AlertDescription>
                        </Alert>
                      </motion.div>
                    )}

                    {success && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Alert className="border-emerald-200 bg-emerald-50">
                          <CheckCircle className="h-4 w-4 text-emerald-600" />
                          <AlertDescription className="text-emerald-700">
                            {isLogin
                              ? "Login berhasil! Mengalihkan ke dashboard..."
                              : "Pendaftaran berhasil! Silakan login dengan akun baru Anda."}
                          </AlertDescription>
                        </Alert>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <AnimatePresence mode="wait">
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-6"
                        >
                          <div className="space-y-2">
                            <Label htmlFor="fullName" className="text-sm font-medium text-slate-700">
                              Nama Lengkap
                            </Label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input
                                id="fullName"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="pl-10 h-14 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200 text-lg"
                                placeholder="Masukkan nama lengkap"
                                required={!isLogin}
                                disabled={isLoading}
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                              Email
                            </Label>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                              <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 h-14 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200 text-lg"
                                placeholder="Masukkan email"
                                required={!isLogin}
                                disabled={isLoading}
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="username" className="text-sm font-medium text-slate-700">
                        Username
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="username"
                          type="text"
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="pl-10 h-14 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200 text-lg"
                          placeholder="Masukkan username"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10 pr-14 h-14 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200 text-lg"
                          placeholder="Masukkan password"
                          required
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-slate-100"
                          onClick={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-5 w-5 text-slate-400" />
                          ) : (
                            <Eye className="h-5 w-5 text-slate-400" />
                          )}
                        </Button>
                      </div>
                    </motion.div>

                    <AnimatePresence>
                      {!isLogin && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-2"
                        >
                          <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                            Konfirmasi Password
                          </Label>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className="pl-10 pr-14 h-14 bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-500 focus:ring-blue-200 text-lg"
                              placeholder="Konfirmasi password"
                              required={!isLogin}
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-10 w-10 p-0 hover:bg-slate-100"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              disabled={isLoading}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-5 w-5 text-slate-400" />
                              ) : (
                                <Eye className="h-5 w-5 text-slate-400" />
                              )}
                            </Button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {isLogin && (
                      <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id="remember"
                          checked={rememberMe}
                          onCheckedChange={(checked) => setRememberMe(!!checked)}
                          className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                        />
                        <Label htmlFor="remember" className="text-sm text-slate-600">
                          Ingat saya selama 30 hari
                        </Label>
                      </motion.div>
                    )}

                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.7 }}
                    >
                      <Button
                        type="submit"
                        className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-lg font-semibold relative overflow-hidden"
                        disabled={isLoading}
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                          animate={{ x: [-100, 400] }}
                          transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                        />
                        {isLoading ? (
                          <div className="flex items-center space-x-3 relative z-10">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>{isLogin ? "Memproses..." : "Mendaftar..."}</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-3 relative z-10">
                            {isLogin ? (
                              <>
                                <Shield className="h-6 w-6" />
                                <span>Masuk ke Dashboard</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-6 w-6" />
                                <span>Daftar Sekarang</span>
                              </>
                            )}
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </form>

                  {/* Demo Credentials - Only show for login */}
                  {isLogin && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                      className="text-center"
                    >
                      <div className="p-6 bg-blue-50 rounded-xl border border-blue-200">
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <Sparkles className="h-5 w-5 text-blue-600" />
                          <p className="text-base font-semibold text-blue-800">Demo Login</p>
                        </div>
                        <div className="text-sm text-blue-700 space-y-2">
                          <p>
                            <span className="font-medium">Username:</span>{" "}
                            <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">admin</code>
                          </p>
                          <p>
                            <span className="font-medium">Password:</span>{" "}
                            <code className="bg-blue-100 px-2 py-1 rounded text-blue-800">admin123</code>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main component that switches between mobile and desktop
export default function AdminAuthPage() {
  const isMobile = useMobile()

  return isMobile ? <MobileAuthPage /> : <DesktopAuthPage />
}
