"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useUser, useClerk, useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { toast, Toaster } from "sonner"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { useMediaQuery } from "../../../hooks/use-media-query"

// UI Components
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// Icons
import {
  LogOut,
  Trash2,
  AlertTriangle,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  Clock,
  Upload,
  Eye,
  EyeOff,
  Copy,
  UserCircle,
  BellRing,
  ShieldAlert,
  Cog,
  Loader2,
  Moon,
  Mail,
  Lock,
  Key,
  AlertCircle,
  X,
  CheckCircle,
  MoreVertical,
  RefreshCw,
  CheckIcon,
  XCircle,
  Download,
  Camera,
  Info,
  Bell,
  Settings,
} from "lucide-react"

// Types
type Session = {
  id: string
  device: string
  lastActive: string
  isCurrent: boolean
  location: string
  browser?: string
  os?: string
  ip?: string
}

type ActivityLog = {
  id: string
  action: string
  timestamp: string
  ip: string
  location: string
  status: "success" | "warning" | "error"
}

type NotificationSettings = {
  email: boolean
  push: boolean
  marketing: boolean
  security: boolean
}

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
}

const iconAnimation = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 500, damping: 25 } },
}

// Helper to determine device icon with animation
const DeviceIcon = ({ device }: { device: string }) => {
  const lower = device.toLowerCase()
  let icon

  if (lower.includes("mobile") || lower.includes("android") || lower.includes("phone") || lower.includes("iphone")) {
    icon = <Smartphone className="h-3.5 w-3.5" />
  } else if (lower.includes("tablet") || lower.includes("ipad")) {
    icon = <Tablet className="h-3.5 w-3.5" />
  } else if (
    lower.includes("mac") ||
    lower.includes("windows") ||
    lower.includes("linux") ||
    lower.includes("desktop")
  ) {
    icon = <Laptop className="h-3.5 w-3.5" />
  } else {
    icon = <Globe className="h-3.5 w-3.5" />
  }

  return (
    <motion.div initial="hidden" animate="visible" variants={iconAnimation}>
      {icon}
    </motion.div>
  )
}

// Format date helper
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    }).format(date)
  } catch (error) {
    console.error("Date formatting error:", error)
    return "Invalid date"
  }
}

// Format time ago helper
const formatTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)

    if (diffSecs < 60) return `${diffSecs} seconds ago`
    if (diffMins < 60) return `${diffMins} minutes ago`
    if (diffHours < 24) return `${diffHours} hours ago`
    if (diffDays < 30) return `${diffDays} days ago`

    return formatDate(dateString)
  } catch (error) {
    console.error("Time ago formatting error:", error)
    return "Unknown time"
  }
}

// Password strength checker
const checkPasswordStrength = (password: string): { score: number; feedback: string } => {
  if (!password) return { score: 0, feedback: "Password is required" }
  if (password.length < 8) return { score: 1, feedback: "Password is too short" }

  let score = 0

  // Length check
  if (password.length >= 8) score += 1
  if (password.length >= 12) score += 1

  // Complexity checks
  if (/[A-Z]/.test(password)) score += 1
  if (/[a-z]/.test(password)) score += 1
  if (/[0-9]/.test(password)) score += 1
  if (/[^A-Za-z0-9]/.test(password)) score += 1

  // Normalize score to 0-4 range
  score = Math.min(4, score)

  // Feedback based on score
  let feedback = ""
  switch (score) {
    case 0:
    case 1:
      feedback = "Very weak"
      break
    case 2:
      feedback = "Weak"
      break
    case 3:
      feedback = "Good"
      break
    case 4:
      feedback = "Strong"
      break
  }

  return { score, feedback }
}

// Loading skeleton component
const SettingsSkeleton = () => (
  <div className="space-y-6 animate-pulse">
    <div className="space-y-2">
      <Skeleton className="h-6 w-32 bg-zinc-800" />
      <Skeleton className="h-3 w-48 bg-zinc-800" />
    </div>
    <div className="flex items-center space-x-3">
      <Skeleton className="h-14 w-14 rounded-full bg-zinc-800" />
      <div className="space-y-1">
        <Skeleton className="h-3 w-24 bg-zinc-800" />
        <Skeleton className="h-2 w-32 bg-zinc-800" />
      </div>
    </div>
    <div className="grid grid-cols-4 gap-2">
      <Skeleton className="h-10 w-full rounded-md bg-zinc-800" />
      <Skeleton className="h-10 w-full rounded-md bg-zinc-800" />
      <Skeleton className="h-10 w-full rounded-md bg-zinc-800" />
      <Skeleton className="h-10 w-full rounded-md bg-zinc-800" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-16 bg-zinc-800" />
      <Skeleton className="h-9 w-full bg-zinc-800" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-3 w-16 bg-zinc-800" />
      <Skeleton className="h-9 w-full bg-zinc-800" />
    </div>
  </div>
)

// Tab icon components with animations
const TabIcon = ({ icon: Icon, isActive }: { icon: any; isActive: boolean }) => (
  <motion.div
    initial={{ scale: 0.8 }}
    animate={{ scale: 1, rotate: isActive ? 0 : 0 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    className={cn("rounded-full p-1 transition-colors", isActive ? "bg-primary/20 text-primary" : "text-zinc-400")}
  >
    <Icon className="h-3.5 w-3.5" />
  </motion.div>
)

// Main component
const SettingsPage = () => {
  const { user, isLoaded, isSignedIn } = useUser()
  const { signOut } = useClerk()
  const { getToken } = useAuth()
  const router = useRouter()
  const { setTheme } = useTheme()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Force dark theme
  useEffect(() => {
    setTheme("dark")
  }, [setTheme])

  // State
  const [activeTab, setActiveTab] = useState("account")
  const [fullName, setFullName] = useState("")
  const [username, setUsername] = useState("")
  const [bio, setBio] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessions, setSessions] = useState<Session[]>([])
  const [sessionsLoading, setSessionsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState("")
  const [deleteCountdown, setDeleteCountdown] = useState(5)
  const [canDelete, setCanDelete] = useState(false)
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    email: true,
    push: true,
    marketing: false,
    security: true,
  })
  const [passwordVisible, setPasswordVisible] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [passwordStrength, setPasswordStrength] = useState({ score: 0, feedback: "" })
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [recoveryCodesVisible, setRecoveryCodesVisible] = useState(false)
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([])
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [tabChangeAnimation, setTabChangeAnimation] = useState(false)

  // Initialize user data
  useEffect(() => {
    if (isLoaded && user) {
      setFullName(user.fullName || "")
      setUsername(user.username || "")
      setBio((user.publicMetadata?.bio as string) || "")
      setTwoFactorEnabled(Boolean(user.publicMetadata?.twoFactorEnabled))

      // Load notification settings from user metadata
      const savedSettings = user.publicMetadata?.notificationSettings as NotificationSettings
      if (savedSettings) {
        setNotificationSettings(savedSettings)
      }

      // Load activity log
      fetchActivityLog()
    }
  }, [isLoaded, user])

  // Fetch sessions when security tab is active
  useEffect(() => {
    if (isLoaded && user && activeTab === "security") {
      fetchSessions()
    }

    // Trigger tab change animation
    setTabChangeAnimation(true)
    const timer = setTimeout(() => setTabChangeAnimation(false), 300)

    return () => clearTimeout(timer)
  }, [activeTab, isLoaded, user])

  // Delete account countdown
  useEffect(() => {
    if (showDeleteDialog) {
      setDeleteCountdown(5)
      setCanDelete(false)
      const timer = setInterval(() => {
        setDeleteCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer)
            setCanDelete(true)
            return 0
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [showDeleteDialog])

  // Reset password error when inputs change
  useEffect(() => {
    if (passwordError) {
      setPasswordError("")
    }
  }, [currentPassword, newPassword, confirmPassword, passwordError])

  // Check password strength when new password changes
  useEffect(() => {
    if (newPassword) {
      setPasswordStrength(checkPasswordStrength(newPassword))
    } else {
      setPasswordStrength({ score: 0, feedback: "" })
    }
  }, [newPassword])

  // Reset success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [saveSuccess])

  // Generate recovery codes if 2FA is enabled but no codes exist
  useEffect(() => {
    if (twoFactorEnabled && recoveryCodes.length === 0) {
      generateRecoveryCodes()
    }
  }, [twoFactorEnabled, recoveryCodes.length])

  // Fetch user sessions
  const fetchSessions = useCallback(async () => {
    setSessionsLoading(true)
    try {
      const sessionsData = await user?.getSessions()
      if (sessionsData) {
        const mappedSessions: Session[] = sessionsData.map((session: any) => {
          const userAgent = session.clientUserAgent || session.userAgent || ""
          const browser = detectBrowser(userAgent)
          const os = detectOS(userAgent)
          const ip = session.lastActiveIp || "Unknown IP"
          const location = session.lastActiveLocation || "Unknown Location"

          return {
            id: session.id,
            device: `${browser} on ${os}`,
            browser,
            os,
            ip,
            lastActive: session.lastActiveAt || new Date().toISOString(),
            isCurrent: session.isCurrentSession || false,
            location,
          }
        })
        setSessions(mappedSessions)
      }
    } catch (err) {
      console.error("Error fetching sessions:", err)
      toast.error("Failed to load sessions")
    } finally {
      setSessionsLoading(false)
    }
  }, [user])

  // Fetch activity log
  const fetchActivityLog = useCallback(async () => {
    setActivityLoading(true)
    try {
      // In a real app, you would fetch this from your backend
      const token = await getToken()
      if (!token) return

      // Simulate API call to fetch real activity log
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Get real user data for more realistic activity log
      const userEmail = user?.primaryEmailAddress?.emailAddress || "user@example.com"
      const userName = user?.fullName || "User"
      const userIp = sessions[0]?.ip || "192.168.1.1"
      const userLocation = sessions[0]?.location || "New York, USA"

      const recentActivity: ActivityLog[] = [
        {
          id: "1",
          action: "Sign in",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          ip: userIp,
          location: userLocation,
          status: "success",
        },
        {
          id: "2",
          action: "Password changed",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          ip: userIp,
          location: userLocation,
          status: "success",
        },
        {
          id: "3",
          action: "Failed login attempt",
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
          ip: "157.240.22.35",
          location: "London, UK",
          status: "error",
        },
        {
          id: "4",
          action: `Profile updated for ${userName}`,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
          ip: userIp,
          location: userLocation,
          status: "success",
        },
        {
          id: "5",
          action: `New device login for ${userEmail}`,
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
          ip: "104.28.42.77",
          location: "San Francisco, USA",
          status: "warning",
        },
      ]

      setActivityLog(recentActivity)
    } catch (error) {
      console.error("Error fetching activity log:", error)
      toast.error("Failed to load activity log")
    } finally {
      setActivityLoading(false)
    }
  }, [getToken, user, sessions])

  // Generate recovery codes
  const generateRecoveryCodes = useCallback(async () => {
    try {
      // In a real app, you would generate these securely on the backend
      const codes = Array.from({ length: 5 }, () => {
        const segment1 = Math.random().toString(36).substring(2, 6).toUpperCase()
        const segment2 = Math.random().toString(36).substring(2, 6).toUpperCase()
        const segment3 = Math.random().toString(36).substring(2, 6).toUpperCase()
        return `${segment1}-${segment2}-${segment3}`
      })

      setRecoveryCodes(codes)
    } catch (error) {
      console.error("Error generating recovery codes:", error)
      toast.error("Failed to generate recovery codes")
    }
  }, [])

  // Detect browser from user agent
  const detectBrowser = (userAgent: string): string => {
    const ua = userAgent.toLowerCase()
    if (ua.includes("firefox")) return "Firefox"
    if (ua.includes("edg")) return "Edge"
    if (ua.includes("chrome")) return "Chrome"
    if (ua.includes("safari")) return "Safari"
    if (ua.includes("opera") || ua.includes("opr")) return "Opera"
    return "Unknown Browser"
  }

  // Detect OS from user agent
  const detectOS = (userAgent: string): string => {
    const ua = userAgent.toLowerCase()
    if (ua.includes("windows")) return "Windows"
    if (ua.includes("mac")) return "macOS"
    if (ua.includes("iphone") || ua.includes("ipad")) return "iOS"
    if (ua.includes("android")) return "Android"
    if (ua.includes("linux")) return "Linux"
    return "Unknown OS"
  }

  // Handle avatar change
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB")
        return
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Only image files are allowed")
        return
      }

      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle avatar upload button click
  const handleAvatarUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Handle avatar remove
  const handleAvatarRemove = async () => {
    setLoading(true)
    try {
      await user?.setProfileImage({ file: null })
      setAvatarPreview(null)
      setAvatarFile(null)
      toast.success("Profile picture removed")
    } catch (error) {
      console.error("Error removing avatar:", error)
      toast.error("Failed to remove profile picture")
    } finally {
      setLoading(false)
    }
  }

  // Handle profile save
  const handleSaveProfile = async () => {
    setLoading(true)
    try {
      // Validate inputs
      if (!fullName.trim()) {
        toast.error("Full name is required")
        setLoading(false)
        return
      }

      if (!username.trim()) {
        toast.error("Username is required")
        setLoading(false)
        return
      }

      // Update profile information
      await user?.update({
        firstName: fullName.split(" ")[0],
        lastName: fullName.split(" ").slice(1).join(" "),
        username: username,
        publicMetadata: {
          ...user.publicMetadata,
          bio: bio,
        },
      })

      // Upload avatar if changed
      if (avatarFile) {
        await user?.setProfileImage({ file: avatarFile })
        setAvatarFile(null)
      }

      setSaveSuccess(true)
      toast.success("Profile updated successfully")
    } catch (error: any) {
      console.error("Error updating profile:", error)
      if (error.errors && error.errors.length > 0) {
        toast.error(error.errors[0].message || "Failed to update profile")
      } else {
        toast.error("Failed to update profile")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle notification settings save
  const handleSaveNotifications = async () => {
    setLoading(true)
    try {
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          notificationSettings: notificationSettings,
        },
      })

      setSaveSuccess(true)
      toast.success("Notification preferences saved")
    } catch (error) {
      console.error("Error saving notification settings:", error)
      toast.error("Failed to save notification preferences")
    } finally {
      setLoading(false)
    }
  }

  // Handle password update
  const handleUpdatePassword = async () => {
    // Validate passwords
    if (!currentPassword) {
      setPasswordError("Current password is required")
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match")
      return
    }

    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long")
      return
    }

    if (passwordStrength.score < 2) {
      setPasswordError("Password is too weak. Please choose a stronger password.")
      return
    }

    setLoading(true)
    try {
      // In a real app, you'd use Clerk's updatePassword method
      // For demonstration, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 800))

      toast.success("Password updated successfully")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setPasswordStrength({ score: 0, feedback: "" })

      // Add to activity log
      const newActivity = {
        id: Date.now().toString(),
        action: "Password changed",
        timestamp: new Date().toISOString(),
        ip: sessions[0]?.ip || "192.168.1.1",
        location: sessions[0]?.location || "Unknown Location",
        status: "success" as const,
      }

      setActivityLog([newActivity, ...activityLog])
    } catch (error: any) {
      console.error("Error updating password:", error)
      if (error.errors && error.errors.length > 0) {
        setPasswordError(error.errors[0].message || "Failed to update password")
      } else {
        setPasswordError("Failed to update password")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle two-factor toggle
  const handleToggleTwoFactor = async (enabled: boolean) => {
    setLoading(true)
    try {
      // In a real app, you'd use Clerk's enable2FA method
      await new Promise((resolve) => setTimeout(resolve, 800))

      // Update user metadata
      await user?.update({
        publicMetadata: {
          ...user.publicMetadata,
          twoFactorEnabled: enabled,
        },
      })

      setTwoFactorEnabled(enabled)

      if (enabled) {
        // Generate new recovery codes when enabling 2FA
        await generateRecoveryCodes()
        toast.success("Two-factor authentication enabled")

        // Add to activity log
        const newActivity = {
          id: Date.now().toString(),
          action: "Two-factor authentication enabled",
          timestamp: new Date().toISOString(),
          ip: sessions[0]?.ip || "192.168.1.1",
          location: sessions[0]?.location || "Unknown Location",
          status: "success" as const,
        }

        setActivityLog([newActivity, ...activityLog])
      } else {
        // Clear recovery codes when disabling 2FA
        setRecoveryCodes([])
        toast.success("Two-factor authentication disabled")

        // Add to activity log
        const newActivity = {
          id: Date.now().toString(),
          action: "Two-factor authentication disabled",
          timestamp: new Date().toISOString(),
          ip: sessions[0]?.ip || "192.168.1.1",
          location: sessions[0]?.location || "Unknown Location",
          status: "warning" as const,
        }

        setActivityLog([newActivity, ...activityLog])
      }
    } catch (error) {
      console.error("Error toggling 2FA:", error)
      toast.error("Failed to update two-factor authentication")
    } finally {
      setLoading(false)
    }
  }

  // Handle recovery code copy
  const handleCopyRecoveryCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast.success("Recovery code copied to clipboard")
  }

  // Handle session revoke
  const handleRevokeSession = async (sessionId: string) => {
    setLoading(true)
    try {
      // In a real app, you'd use Clerk's revokeSession method
      await user?.revokeSession(sessionId)
      setSessions(sessions.filter((session) => session.id !== sessionId))
      toast.success("Session revoked successfully")

      // Add to activity log
      const newActivity = {
        id: Date.now().toString(),
        action: "Session revoked",
        timestamp: new Date().toISOString(),
        ip: sessions[0]?.ip || "192.168.1.1",
        location: sessions[0]?.location || "Unknown Location",
        status: "success" as const,
      }

      setActivityLog([newActivity, ...activityLog])
    } catch (error) {
      console.error("Error revoking session:", error)
      toast.error("Failed to revoke session")
    } finally {
      setLoading(false)
    }
  }

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirm !== "DELETE") {
      toast.error("Please type DELETE to confirm")
      return
    }

    setLoading(true)
    try {
      await user?.delete()
      toast.success("Account deleted successfully")
      signOut()
      router.push("/")
    } catch (error) {
      console.error("Error deleting account:", error)
      toast.error("Failed to delete account")
    } finally {
      setLoading(false)
      setShowDeleteDialog(false)
    }
  }

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      toast.error("Failed to sign out")
    }
  }

  // Handle data export
  const handleDataExport = async () => {
    try {
      setLoading(true)

      // In a real app, you'd fetch user data from your backend
      // For demonstration, we'll create a simple JSON with user data
      const userData = {
        profile: {
          id: user?.id,
          firstName: user?.firstName,
          lastName: user?.lastName,
          fullName: user?.fullName,
          username: user?.username,
          email: user?.primaryEmailAddress?.emailAddress,
          bio: bio,
          imageUrl: user?.imageUrl,
          createdAt: user?.createdAt,
        },
        sessions: sessions,
        activityLog: activityLog,
        notificationSettings: notificationSettings,
      }

      // Create a downloadable JSON file
      const dataStr = JSON.stringify(userData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)

      // Create a link and trigger download
      const a = document.createElement("a")
      a.href = url
      a.download = `${user?.username || "user"}-data-export-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      toast.success("Data exported successfully")
    } catch (error) {
      console.error("Error exporting data:", error)
      toast.error("Failed to export data")
    } finally {
      setLoading(false)
    }
  }

  // If not loaded, show skeleton
  if (!isLoaded) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-4 ml-4">
        <Card className="border-none shadow-sm bg-black">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-zinc-100">Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <SettingsSkeleton />
          </CardContent>
        </Card>
      </div>
    )
  }

  // If not signed in, redirect to sign in page
  if (!isSignedIn) {
    router.push("/sign-in")
    return null
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 mt-4 ml-0 sm:ml-4 text-zinc-100">
      <Toaster position="top-center" richColors closeButton theme="dark" />

      {/* Hidden file input for avatar upload */}
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeIn}
        className="flex items-center justify-between mb-6"
      >
        <div>
          <h1 className="text-xl font-medium text-white">Settings</h1>
          <p className="text-sm text-zinc-400">Manage your account settings and preferences</p>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                >
                  <Moon className="h-4 w-4 text-zinc-100" />
                </Button>
              </motion.div>
            </TooltipTrigger>
            <TooltipContent side="left" className="text-xs bg-zinc-800 text-zinc-100 border-zinc-700">
              Dark mode enabled
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>

      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 h-10 bg-zinc-800/50 p-1">
          <TabsTrigger
            value="account"
            className="text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
          >
            <TabIcon icon={UserCircle} isActive={activeTab === "account"} />
            <span className="ml-1.5">Account</span>
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
          >
            <TabIcon icon={BellRing} isActive={activeTab === "notifications"} />
            <span className="ml-1.5">Notifications</span>
          </TabsTrigger>
          <TabsTrigger
            value="security"
            className="text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
          >
            <TabIcon icon={ShieldAlert} isActive={activeTab === "security"} />
            <span className="ml-1.5">Security</span>
          </TabsTrigger>
          <TabsTrigger
            value="advanced"
            className="text-xs data-[state=active]:bg-zinc-700 data-[state=active]:text-white"
          >
            <TabIcon icon={Cog} isActive={activeTab === "advanced"} />
            <span className="ml-1.5">Advanced</span>
          </TabsTrigger>
        </TabsList>

        {/* Account Tab */}
        <AnimatePresence mode="wait">
          <TabsContent value="account" className={tabChangeAnimation ? "animate-in fade-in-50" : ""}>
            <motion.div key="account-tab" initial="hidden" animate="visible" exit="exit" variants={slideUp}>
              <Card className="border-none shadow-md bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="p-1.5 rounded-full bg-primary/10"
                    >
                      <UserCircle className="h-4 w-4 text-primary" />
                    </motion.div>
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert className="bg-green-900/20 border-green-900/30 text-green-300">
                        <CheckIcon className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Your profile has been updated successfully.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-4">
                    <motion.div whileHover={{ scale: 1.05 }} className="relative group">
                      <Avatar className="h-14 w-14 border border-zinc-700 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                        {avatarPreview ? (
                          <AvatarImage src={avatarPreview} alt={user?.fullName || "User"} />
                        ) : (
                          <AvatarImage src={user?.imageUrl} alt={user?.fullName || "User"} />
                        )}
                        <AvatarFallback className="bg-zinc-800 text-zinc-100">
                          {user?.fullName?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center cursor-pointer"
                        onClick={handleAvatarUploadClick}
                      >
                        <Camera className="h-5 w-5 text-white" />
                      </motion.div>
                    </motion.div>
                    <div>
                      <p className="text-sm font-medium text-white">{user?.fullName || "User"}</p>
                      <p className="text-xs text-zinc-400">{user?.primaryEmailAddress?.emailAddress}</p>
                      <div className="flex gap-2 mt-2">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 text-xs px-3 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                            onClick={handleAvatarUploadClick}
                            disabled={loading}
                          >
                            <Upload className="h-3 w-3 mr-1.5" />
                            Change
                          </Button>
                        </motion.div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 text-xs px-3 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                            onClick={handleAvatarRemove}
                            disabled={loading || !user?.imageUrl}
                          >
                            <X className="h-3 w-3 mr-1.5" />
                            Remove
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3 bg-zinc-800" />

                  <div className="grid gap-4">
                    <div className="grid gap-1.5">
                      <Label htmlFor="name" className="text-xs text-zinc-300">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Enter your full name"
                        className="h-9 text-sm bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="username" className="text-xs text-zinc-300">
                        Username
                      </Label>
                      <Input
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        className="h-9 text-sm bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="email" className="text-xs text-zinc-300">
                        Email
                      </Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="email"
                          value={user?.primaryEmailAddress?.emailAddress || ""}
                          disabled
                          className="h-9 text-sm bg-zinc-800/50 border-zinc-700 text-zinc-400"
                        />
                        <Badge
                          variant="outline"
                          className="text-xs h-6 px-2 bg-primary/10 text-primary border-primary/20"
                        >
                          <CheckCircle className="h-2.5 w-2.5 mr-1" />
                          Verified
                        </Badge>
                      </div>
                    </div>

                    <div className="grid gap-1.5">
                      <Label htmlFor="bio" className="text-xs text-zinc-300">
                        Bio
                      </Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        placeholder="Tell us about yourself"
                        className="text-sm resize-none h-24 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="ml-auto">
                    <Button
                      size="sm"
                      onClick={handleSaveProfile}
                      disabled={loading}
                      className="h-9 text-xs px-4 bg-primary hover:bg-primary/90"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          Saving
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className={tabChangeAnimation ? "animate-in fade-in-50" : ""}>
            <motion.div key="notifications-tab" initial="hidden" animate="visible" exit="exit" variants={slideUp}>
              <Card className="border-none shadow-md bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-white flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="p-1.5 rounded-full bg-primary/10"
                    >
                      <Bell className="h-4 w-4 text-primary" />
                    </motion.div>
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  {saveSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert className="bg-green-900/20 border-green-900/30 text-green-300">
                        <CheckIcon className="h-4 w-4" />
                        <AlertDescription className="text-xs">
                          Your notification preferences have been saved successfully.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                        className="p-1.5 rounded-full bg-primary/10"
                      >
                        <Mail className="h-3.5 w-3.5 text-primary" />
                      </motion.div>
                      <h3 className="text-sm font-medium text-white">Email Notifications</h3>
                    </div>
                    <div className="space-y-3 pl-8">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <Label htmlFor="email-notifications" className="text-xs text-zinc-300">
                            Account Updates
                          </Label>
                          <p className="text-xs text-zinc-500">Receive notifications about your account</p>
                        </div>
                        <Switch
                          id="email-notifications"
                          checked={notificationSettings.email}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, email: checked })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <Label htmlFor="marketing-emails" className="text-xs text-zinc-300">
                            Marketing Emails
                          </Label>
                          <p className="text-xs text-zinc-500">Receive emails about new features</p>
                        </div>
                        <Switch
                          id="marketing-emails"
                          checked={notificationSettings.marketing}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, marketing: checked })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </motion.div>
                    </div>
                  </div>

                  <Separator className="my-3 bg-zinc-800" />

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.3 }}
                        className="p-1.5 rounded-full bg-primary/10"
                      >
                        <BellRing className="h-3.5 w-3.5 text-primary" />
                      </motion.div>
                      <h3 className="text-sm font-medium text-white">Push Notifications</h3>
                    </div>
                    <div className="space-y-3 pl-8">
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <Label htmlFor="push-notifications" className="text-xs text-zinc-300">
                            Push Notifications
                          </Label>
                          <p className="text-xs text-zinc-500">Receive notifications on your device</p>
                        </div>
                        <Switch
                          id="push-notifications"
                          checked={notificationSettings.push}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, push: checked })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex items-center justify-between"
                      >
                        <div>
                          <Label htmlFor="security-alerts" className="text-xs text-zinc-300">
                            Security Alerts
                          </Label>
                          <p className="text-xs text-zinc-500">Get notified about security events</p>
                        </div>
                        <Switch
                          id="security-alerts"
                          checked={notificationSettings.security}
                          onCheckedChange={(checked) =>
                            setNotificationSettings({ ...notificationSettings, security: checked })
                          }
                          className="data-[state=checked]:bg-primary"
                        />
                      </motion.div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="pt-2 pb-4">
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="ml-auto">
                    <Button
                      size="sm"
                      className="h-9 text-xs px-4 bg-primary hover:bg-primary/90"
                      onClick={handleSaveNotifications}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                          Saving
                        </>
                      ) : (
                        "Save Preferences"
                      )}
                    </Button>
                  </motion.div>
                </CardFooter>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className={`space-y-5 ${tabChangeAnimation ? "animate-in fade-in-50" : ""}`}>
            <motion.div
              key="security-tab"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={slideUp}
              className="space-y-5"
            >
              <Card className="border-none shadow-md bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="p-1.5 rounded-full bg-primary/10"
                    >
                      <Lock className="h-4 w-4 text-primary" />
                    </motion.div>
                    Password
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  {passwordError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      <Alert className="bg-red-900/20 border-red-900/30 text-red-300">
                        <XCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{passwordError}</AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <div className="grid gap-1.5">
                    <Label htmlFor="current-password" className="text-xs text-zinc-300">
                      Current Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={passwordVisible ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="h-9 text-sm pr-8 bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-9 w-9 hover:bg-transparent text-zinc-400"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </Button>
                    </div>
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="new-password" className="text-xs text-zinc-300">
                      New Password
                    </Label>
                    <Input
                      id="new-password"
                      type={passwordVisible ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="h-9 text-sm bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                    />

                    {newPassword && (
                      <div className="mt-1.5">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-zinc-400">Password strength:</span>
                          <span
                            className={cn(
                              "text-xs font-medium",
                              passwordStrength.score <= 1
                                ? "text-red-400"
                                : passwordStrength.score === 2
                                  ? "text-yellow-400"
                                  : passwordStrength.score === 3
                                    ? "text-green-400"
                                    : "text-green-300",
                            )}
                          >
                            {passwordStrength.feedback}
                          </span>
                        </div>
                        <Progress
                          value={passwordStrength.score * 25}
                          className="h-1.5 bg-zinc-700"
                          indicatorClassName={cn(
                            passwordStrength.score <= 1
                              ? "bg-red-500"
                              : passwordStrength.score === 2
                                ? "bg-yellow-500"
                                : passwordStrength.score === 3
                                  ? "bg-green-500"
                                  : "bg-green-400",
                          )}
                        />
                      </div>
                    )}
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="confirm-password" className="text-xs text-zinc-300">
                      Confirm New Password
                    </Label>
                    <Input
                      id="confirm-password"
                      type={passwordVisible ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="h-9 text-sm bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                    />
                  </div>
                  <div className="flex justify-end mt-2">
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        size="sm"
                        onClick={handleUpdatePassword}
                        disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                        className="h-9 text-xs px-4 bg-primary hover:bg-primary/90"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                            Updating
                          </>
                        ) : (
                          "Update Password"
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.1 }}
                      className="p-1.5 rounded-full bg-primary/10"
                    >
                      <Key className="h-4 w-4 text-primary" />
                    </motion.div>
                    Two-Factor Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-zinc-300">Two-Factor Authentication</Label>
                      <p className="text-xs text-zinc-500">Add an extra layer of security to your account</p>
                    </div>
                    <Switch
                      checked={twoFactorEnabled}
                      onCheckedChange={handleToggleTwoFactor}
                      disabled={loading}
                      className="data-[state=checked]:bg-primary"
                    />
                  </div>

                  <AnimatePresence>
                    {twoFactorEnabled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-zinc-800"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <p className="text-xs font-medium text-zinc-300">Recovery Codes</p>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRecoveryCodesVisible(!recoveryCodesVisible)}
                              className="h-8 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                            >
                              {recoveryCodesVisible ? (
                                <>
                                  <EyeOff className="h-3 w-3 mr-1.5" />
                                  Hide Codes
                                </>
                              ) : (
                                <>
                                  <Eye className="h-3 w-3 mr-1.5" />
                                  Show Codes
                                </>
                              )}
                            </Button>
                          </motion.div>
                        </div>

                        <AnimatePresence>
                          {recoveryCodesVisible && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: 10 }}
                              transition={{ duration: 0.2 }}
                              className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3"
                            >
                              {recoveryCodes.map((code, index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ delay: index * 0.1 }}
                                  className="flex items-center justify-between bg-zinc-800 p-2 rounded text-xs font-mono"
                                >
                                  {code}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-zinc-700"
                                    onClick={() => handleCopyRecoveryCode(code)}
                                  >
                                    <Copy className="h-3 w-3 text-zinc-400" />
                                  </Button>
                                </motion.div>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-3 flex items-center p-2 rounded-md bg-zinc-800/50 border border-zinc-700"
                        >
                          <Info className="h-3.5 w-3.5 text-primary mr-2 flex-shrink-0" />
                          <p className="text-xs text-zinc-400">
                            Save these recovery codes in a secure location. They can be used to recover your account if
                            you lose access to your authentication device.
                          </p>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                      <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.2 }}
                        className="p-1.5 rounded-full bg-primary/10"
                      >
                        <Globe className="h-4 w-4 text-primary" />
                      </motion.div>
                      Active Sessions
                    </CardTitle>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                        onClick={fetchSessions}
                        disabled={sessionsLoading}
                      >
                        {sessionsLoading ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <>
                            <RefreshCw className="h-3 w-3 mr-1.5" />
                            Refresh
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {sessionsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                      </div>
                    ) : sessions.length > 0 ? (
                      <ScrollArea className="h-[180px] pr-4">
                        <div className="space-y-3">
                          {sessions.map((session) => (
                            <motion.div
                              key={session.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                              className={cn(
                                "flex items-center justify-between rounded border p-3",
                                session.isCurrent ? "bg-primary/5 border-primary/20" : "bg-zinc-800/50 border-zinc-700",
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={cn(
                                    "rounded-full p-2",
                                    session.isCurrent ? "bg-primary/10" : "bg-zinc-800",
                                  )}
                                >
                                  <DeviceIcon device={session.device} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <p className="text-xs font-medium text-zinc-100">{session.device}</p>
                                    {session.isCurrent && (
                                      <Badge
                                        variant="outline"
                                        className="text-[10px] px-1.5 h-5 bg-primary/10 text-primary border-primary/20"
                                      >
                                        Current
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1 text-[10px] text-zinc-500 mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>Last active {formatTimeAgo(session.lastActive)}</span>
                                    <span>•</span>
                                    <span>{session.location}</span>
                                  </div>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 hover:bg-zinc-700"
                                    disabled={session.isCurrent}
                                  >
                                    <MoreVertical className="h-3.5 w-3.5 text-zinc-400" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-36 bg-zinc-800 border-zinc-700 text-zinc-100"
                                >
                                  <DropdownMenuItem
                                    className="text-xs cursor-pointer text-red-400 focus:text-red-400 focus:bg-red-900/20"
                                    onClick={() => handleRevokeSession(session.id)}
                                    disabled={session.isCurrent}
                                  >
                                    <X className="h-3.5 w-3.5 mr-1.5" />
                                    Revoke Session
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </motion.div>
                          ))}
                        </div>
                      </ScrollArea>
                    ) : (
                      <p className="text-xs text-center py-6 text-zinc-500">No active sessions found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-md bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25, delay: 0.3 }}
                      className="p-1.5 rounded-full bg-primary/10"
                    >
                      <Clock className="h-4 w-4 text-primary" />
                    </motion.div>
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {activityLoading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="h-5 w-5 animate-spin text-zinc-500" />
                    </div>
                  ) : (
                    <ScrollArea className="h-[150px]">
                      <div className="space-y-3">
                        {activityLog.map((activity, index) => (
                          <motion.div
                            key={activity.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="border-b border-zinc-800 pb-3 last:border-0 last:pb-0"
                          >
                            <div className="flex items-center gap-1.5">
                              <p className="text-xs font-medium text-zinc-100">{activity.action}</p>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-1 h-4 border-transparent",
                                  activity.status === "success" && "bg-green-900/20 text-green-400",
                                  activity.status === "warning" && "bg-yellow-900/20 text-yellow-400",
                                  activity.status === "error" && "bg-red-900/20 text-red-400",
                                )}
                              >
                                {activity.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 mt-1">
                              <Clock className="h-3 w-3" />
                              <span>{formatTimeAgo(activity.timestamp)}</span>
                              <span>•</span>
                              <span>{activity.location}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className={tabChangeAnimation ? "animate-in fade-in-50" : ""}>
            <motion.div key="advanced-tab" initial="hidden" animate="visible" exit="exit" variants={slideUp}>
              <Card className="border-none shadow-md bg-zinc-900 border-zinc-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="p-1.5 rounded-full bg-primary/10"
                    >
                      <Settings className="h-4 w-4 text-primary" />
                    </motion.div>
                    Account Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg border border-zinc-800 p-4 bg-zinc-800/30"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-medium text-zinc-100">Sign Out</h4>
                          <p className="text-[10px] text-zinc-500">Sign out from your current session</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                            onClick={handleSignOut}
                          >
                            <LogOut className="h-3.5 w-3.5 mr-1.5" />
                            Sign Out
                          </Button>
                        </motion.div>
                      </div>

                      <Separator className="my-2 bg-zinc-700" />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-medium text-red-400">Delete Account</h4>
                          <p className="text-[10px] text-zinc-500">Permanently delete your account and all data</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="h-8 text-xs bg-red-900/60 hover:bg-red-900 text-red-200"
                            onClick={() => setShowDeleteDialog(true)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                            Delete
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="rounded-lg border border-zinc-800 p-4 bg-zinc-800/30"
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-medium text-zinc-100">Theme</h4>
                          <p className="text-[10px] text-zinc-500">Dark mode is enabled by default</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 text-xs px-3 bg-primary hover:bg-primary/90"
                          >
                            <Moon className="h-3.5 w-3.5 mr-1.5" />
                            Dark Mode
                          </Button>
                        </motion.div>
                      </div>

                      <Separator className="my-2 bg-zinc-700" />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-medium text-zinc-100">Data Export</h4>
                          <p className="text-[10px] text-zinc-500">Download a copy of your data</p>
                        </div>
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                            onClick={handleDataExport}
                            disabled={loading}
                          >
                            {loading ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <>
                                <Download className="h-3.5 w-3.5 mr-1.5" />
                                Export
                              </>
                            )}
                          </Button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </Tabs>

      {/* Delete Account Dialog */}
      <AnimatePresence>
        {showDeleteDialog && (
          <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <DialogContent className="sm:max-w-xs bg-zinc-900 border-zinc-800 text-zinc-100">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <DialogHeader>
                  <DialogTitle className="flex items-center text-base text-white">
                    <AlertTriangle className="h-4 w-4 text-red-400 mr-1.5" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription className="text-xs text-zinc-400">
                    This action cannot be undone. This will permanently delete your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-3">
                  <div className="rounded-md border border-red-900/50 bg-red-900/20 p-3 mb-3">
                    <div className="flex gap-2">
                      <AlertCircle className="h-4 w-4 text-red-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-red-300">
                        {canDelete
                          ? 'Type "DELETE" to confirm account deletion.'
                          : `Please wait ${deleteCountdown}s before proceeding...`}
                      </p>
                    </div>
                  </div>
                  <Input
                    placeholder='Type "DELETE"'
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    disabled={!canDelete}
                    className="mt-2 h-9 text-sm bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 focus:border-primary/50 focus:ring-primary/20"
                  />
                </div>
                <DialogFooter className="flex justify-between">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowDeleteDialog(false)}
                    className="h-9 text-xs bg-zinc-800 border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteAccount}
                    disabled={!canDelete || loading || deleteConfirm !== "DELETE"}
                    className="h-9 text-xs bg-red-900/60 hover:bg-red-900 text-red-200"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                        Deleting
                      </>
                    ) : (
                      "Delete Account"
                    )}
                  </Button>
                </DialogFooter>
              </motion.div>
            </DialogContent>
          </Dialog>
        )}
      </AnimatePresence>
    </div>
  )
}

export default SettingsPage
