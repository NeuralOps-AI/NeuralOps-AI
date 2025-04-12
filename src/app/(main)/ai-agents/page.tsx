"use client"

import type React from "react"

import { useState, useRef, useCallback, useMemo, useEffect } from "react"
import Image from "next/image"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { toast, Toaster } from "sonner"
import { motion } from "framer-motion"
import {
  AlertCircle,
  CheckCircle2,
  Bot,
  Settings2,
  Trash2,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Download,
  Upload,
  RefreshCw,
  Plus,
  Zap,
  BarChart3,
  Clock,
  Tag,
  Save,
  X,
  CalendarIcon,
  ChevronDown,
  BarChart2,
  History,
  FileText,
  Copy,
  Clipboard,
  Star,
  Layers,
  Folder,
  FolderPlus,
  PanelLeft,
  MoreHorizontal,
  Moon,
  Sun,
  CheckIcon as Checkbox,
  Sparkles,
} from "lucide-react"
import { format } from "date-fns"
import { useTheme } from "next-themes"

interface Agent {
  id: number
  name: string
  description: string
  status: "Active" | "Maintenance" | "Offline"
  avatarUrl?: string
  createdAt: Date
  lastActive?: Date
  capabilities: string[]
  type: "Assistant" | "Processor" | "Analyzer"
  performance?: number
  tags?: string[]
  schedule?: Date
  version?: string
  creator?: string
  usageCount?: number
  favorited?: boolean
  notes?: string
  category?: string
  priority?: "Low" | "Medium" | "High"
  lastModified?: Date
  history?: AgentHistoryEntry[]
}

interface AgentHistoryEntry {
  date: Date
  action: string
  details?: string
}

interface AgentAnalytics {
  totalAgents: number
  activeAgents: number
  totalUsage: number
  averagePerformance: number
  topPerformer?: Agent
  recentActivity: number
  typeDistribution: Record<string, number>
  statusDistribution: Record<string, number>
}

const INITIAL_FORM_STATE = {
  name: "",
  description: "",
  status: "Active" as const,
  capabilities: [] as string[],
  type: "Assistant" as const,
  tags: [] as string[],
  priority: "Medium" as const,
  category: "",
  version: "1.0.0",
  notes: "",
}

const AGENT_STATUSES = {
  Active: { label: "Active", color: "text-emerald-400", bgColor: "bg-emerald-500/20", icon: CheckCircle2 },
  Maintenance: { label: "Maintenance", color: "text-amber-400", bgColor: "bg-amber-500/20", icon: Settings2 },
  Offline: { label: "Offline", color: "text-rose-400", bgColor: "bg-rose-500/20", icon: AlertCircle },
} as const

const AGENT_TYPES = {
  Assistant: {
    label: "AI Assistant",
    description: "Handles user interactions and queries",
    icon: Bot,
    color: "text-cyan-400",
    bgColor: "bg-cyan-500/20",
  },
  Processor: {
    label: "Data Processor",
    description: "Processes and transforms data",
    icon: Zap,
    color: "text-fuchsia-400",
    bgColor: "bg-fuchsia-500/20",
  },
  Analyzer: {
    label: "Data Analyzer",
    description: "Analyzes and generates insights",
    icon: BarChart3,
    color: "text-teal-400",
    bgColor: "bg-teal-500/20",
  },
} as const

const AGENT_PRIORITIES = {
  Low: { label: "Low", color: "text-slate-400", bgColor: "bg-slate-500/20" },
  Medium: { label: "Medium", color: "text-cyan-400", bgColor: "bg-cyan-500/20" },
  High: { label: "High", color: "text-rose-400", bgColor: "bg-rose-500/20" },
} as const

const SAMPLE_CAPABILITIES = [
  "Natural Language Processing",
  "Task Automation",
  "Data Analysis",
  "Image Recognition",
  "Voice Interaction",
  "Sentiment Analysis",
  "Recommendation Engine",
  "Knowledge Base",
  "Multi-language Support",
  "Contextual Understanding",
  "Real-time Processing",
  "Predictive Analytics",
]

const SAMPLE_CATEGORIES = [
  "Customer Support",
  "Data Processing",
  "Content Creation",
  "Research",
  "Analytics",
  "Automation",
  "Monitoring",
  "Personal Assistant",
  "Development",
  "Marketing",
]

const Container = ({ className, children }: { className?: string; children: React.ReactNode }) => (
  <div className={`container mx-auto px-4 ${className || ""}`}>{children}</div>
)

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
}

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  hover: {
    y: -5,
    boxShadow: "0 10px 25px -5px rgba(124, 58, 237, 0.2)",
    borderColor: "rgba(139, 92, 246, 0.5)",
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 10,
    },
  },
}

const AgentCreationPage = () => {
  const { theme, setTheme } = useTheme()
  const [agents, setAgents] = useState<Agent[]>([])
  const [formData, setFormData] = useState(INITIAL_FORM_STATE)
  const [loading, setLoading] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [sortField, setSortField] = useState<"createdAt" | "name" | "performance" | "priority">("createdAt")
  const [newCapability, setNewCapability] = useState("")
  const [newTag, setNewTag] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [viewMode, setViewMode] = useState<"list" | "grid" | "analytics">("grid")
  const [selectedAgents, setSelectedAgents] = useState<number[]>([])
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showTemplatesDialog, setShowTemplatesDialog] = useState(false)
  const [pageLoaded, setPageLoaded] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const importFileRef = useRef<HTMLInputElement>(null)

  // Set page loaded after initial render
  useEffect(() => {
    setPageLoaded(true)
  }, [])

  // Load agents from localStorage on mount
  useEffect(() => {
    try {
      const savedAgents = localStorage.getItem("agents")
      if (savedAgents) {
        const parsed = JSON.parse(savedAgents)
        setAgents(
          parsed.map((agent: any) => ({
            ...agent,
            createdAt: new Date(agent.createdAt),
            lastActive: agent.lastActive ? new Date(agent.lastActive) : undefined,
            schedule: agent.schedule ? new Date(agent.schedule) : undefined,
            lastModified: agent.lastModified ? new Date(agent.lastModified) : undefined,
            history: agent.history
              ? agent.history.map((entry: any) => ({
                  ...entry,
                  date: new Date(entry.date),
                }))
              : [],
          })),
        )
      }
    } catch (err) {
      console.error("Error loading agents from localStorage:", err)
      toast.error("Error loading agents", {
        description: "There was a problem loading your saved agents.",
      })
    }
  }, [])

  // Save agents to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem("agents", JSON.stringify(agents))
    } catch (err) {
      console.error("Error saving agents to localStorage:", err)
      toast.error("Error saving agents", {
        description: "There was a problem saving your agents.",
      })
    }
  }, [agents])

  const generateAvatar = useCallback((agentName: string) => {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(agentName)}`
  }, [])

  const updatePreviewAvatar = useCallback(
    (agentName: string, file?: File | null) => {
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => setPreviewAvatar(reader.result as string)
        reader.readAsDataURL(file)
      } else if (agentName.trim().length > 0) {
        setPreviewAvatar(generateAvatar(agentName))
      } else {
        setPreviewAvatar(null)
      }
    },
    [generateAvatar],
  )

  const handleInputChange = useCallback(
    (field: keyof typeof INITIAL_FORM_STATE, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }))
      if (field === "name") {
        updatePreviewAvatar(value, uploadedFile)
      }
    },
    [uploadedFile, updatePreviewAvatar],
  )

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) {
        if (file.size > 5 * 1024 * 1024) {
          setError("File size must be less than 5MB")
          toast.error("File too large", {
            description: "Avatar image must be less than 5MB",
          })
          return
        }
        setUploadedFile(file)
        updatePreviewAvatar(formData.name, file)
        setError(null)
      }
    },
    [formData.name, updatePreviewAvatar],
  )

  const addCapability = useCallback(() => {
    if (newCapability.trim() && !formData.capabilities.includes(newCapability.trim())) {
      handleInputChange("capabilities", [...formData.capabilities, newCapability.trim()])
      setNewCapability("")
    }
  }, [formData.capabilities, handleInputChange, newCapability])

  const removeCapability = useCallback(
    (capability: string) => {
      handleInputChange(
        "capabilities",
        formData.capabilities.filter((c) => c !== capability),
      )
    },
    [formData.capabilities, handleInputChange],
  )

  const addTag = useCallback(() => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange("tags", [...(formData.tags || []), newTag.trim()])
      setNewTag("")
    }
  }, [formData.tags, handleInputChange, newTag])

  const removeTag = useCallback(
    (tag: string) => {
      handleInputChange("tags", formData.tags?.filter((t) => t !== tag) || [])
    },
    [formData.tags, handleInputChange],
  )

  const resetForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE)
    setUploadedFile(null)
    setPreviewAvatar(null)
    setSelectedDate(undefined)
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }, [])

  const handleCreateAgent = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      try {
        setLoading(true)
        setError(null)

        if (!formData.name.trim() || !formData.description.trim()) {
          throw new Error("Please fill in all required fields")
        }

        const now = new Date()
        const newAgent: Agent = {
          id: Date.now(),
          ...formData,
          createdAt: now,
          lastActive: now,
          lastModified: now,
          avatarUrl: previewAvatar || generateAvatar(formData.name),
          capabilities:
            formData.capabilities.length > 0
              ? formData.capabilities
              : [SAMPLE_CAPABILITIES[Math.floor(Math.random() * SAMPLE_CAPABILITIES.length)]],
          performance: Math.floor(Math.random() * 100),
          usageCount: 0,
          favorited: false,
          history: [
            {
              date: now,
              action: "Created",
              details: `Agent created with status: ${formData.status}`,
            },
          ],
        }

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 800))

        setAgents((prev) => [...prev, newAgent])
        resetForm()
        setShowCreateDialog(false)

        toast.success("Agent created", {
          description: `${newAgent.name} has been successfully created.`,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        toast.error("Error creating agent", {
          description: err instanceof Error ? err.message : "An error occurred",
        })
      } finally {
        setLoading(false)
      }
    },
    [formData, previewAvatar, generateAvatar, resetForm],
  )

  const handleUpdateAgent = useCallback((updatedAgent: Agent) => {
    const now = new Date()
    const agentWithHistory = {
      ...updatedAgent,
      lastModified: now,
      history: [
        ...(updatedAgent.history || []),
        {
          date: now,
          action: "Updated",
          details: `Agent updated with status: ${updatedAgent.status}`,
        },
      ],
    }

    setAgents((prev) => prev.map((agent) => (agent.id === updatedAgent.id ? agentWithHistory : agent)))
    toast.success("Agent updated", {
      description: `${updatedAgent.name} has been successfully updated.`,
    })
  }, [])

  const handleDeleteAgent = useCallback((agentId: number, agentName: string) => {
    setAgents((prev) => prev.filter((agent) => agent.id !== agentId))
    toast.success("Agent deleted", {
      description: `${agentName} has been successfully deleted.`,
    })
  }, [])

  const importAgents = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const importedAgents = JSON.parse(event.target?.result as string)
        if (!Array.isArray(importedAgents)) {
          throw new Error("Invalid format: imported data is not an array")
        }

        const now = new Date()
        const processedAgents = importedAgents.map((agent: any) => ({
          ...agent,
          createdAt: new Date(agent.createdAt),
          lastActive: agent.lastActive ? new Date(agent.lastActive) : undefined,
          schedule: agent.schedule ? new Date(agent.schedule) : undefined,
          lastModified: now,
          history: [
            ...(agent.history
              ? agent.history.map((entry: any) => ({
                  ...entry,
                  date: new Date(entry.date),
                }))
              : []),
            {
              date: now,
              action: "Imported",
              details: "Agent was imported from file",
            },
          ],
        }))

        setAgents((prev) => {
          // Merge with existing agents, avoiding duplicates by ID
          const existingIds = new Set(prev.map((a) => a.id))
          const newAgents = processedAgents.filter((a: Agent) => !existingIds.has(a.id))
          return [...prev, ...newAgents]
        })

        toast.success("Agents imported", {
          description: `${processedAgents.length} agents imported successfully.`,
        })
      } catch (err) {
        console.error("Error importing agents:", err)
        toast.error("Import failed", {
          description: "There was a problem importing your agents. Please check the file format.",
        })
      }
    }
    reader.readAsText(file)

    // Reset the input
    e.target.value = ""
  }, [])

  // Define filteredAndSortedAgents before it's used in toggleSelectAll
  const filteredAndSortedAgents = useMemo(() => {
    return [...agents]
      .filter((agent) => {
        const matchesSearch =
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.capabilities.some((cap) => cap.toLowerCase().includes(searchTerm.toLowerCase())) ||
          agent.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
          agent.category?.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesStatus = filterStatus === "all" || agent.status === filterStatus
        const matchesType = filterType === "all" || agent.type === filterType
        const matchesCategory = filterCategory === "all" || agent.category === filterCategory
        const matchesPriority = filterPriority === "all" || agent.priority === filterPriority

        const matchesTab =
          activeTab === "all" ||
          (activeTab === "active" && agent.status === "Active") ||
          (activeTab === "maintenance" && agent.status === "Maintenance") ||
          (activeTab === "offline" && agent.status === "Offline") ||
          (activeTab === "favorites" && agent.favorited)

        return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesPriority && matchesTab
      })
      .sort((a, b) => {
        if (sortField === "name") {
          return sortOrder === "asc" ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)
        } else if (sortField === "performance") {
          const perfA = a.performance || 0
          const perfB = b.performance || 0
          return sortOrder === "asc" ? perfA - perfB : perfB - perfA
        } else if (sortField === "priority") {
          const priorityRank = { High: 3, Medium: 2, Low: 1 }
          const rankA = priorityRank[a.priority || "Medium"]
          const rankB = priorityRank[b.priority || "Medium"]
          return sortOrder === "asc" ? rankA - rankB : rankB - rankA
        } else {
          // Default sort by createdAt
          const dateA = a.createdAt.getTime()
          const dateB = b.createdAt.getTime()
          return sortOrder === "asc" ? dateA - dateB : dateB - dateA
        }
      })
  }, [agents, searchTerm, filterStatus, filterType, filterCategory, filterPriority, sortOrder, sortField, activeTab])

  const handleBatchDelete = useCallback(() => {
    if (selectedAgents.length === 0) return

    const agentsToDelete = agents.filter((agent) => selectedAgents.includes(agent.id))
    const agentNames = agentsToDelete.map((agent) => agent.name).join(", ")

    setAgents((prev) => prev.filter((agent) => !selectedAgents.includes(agent.id)))
    setSelectedAgents([])
    setIsSelectMode(false)

    toast.success("Agents deleted", {
      description: `${selectedAgents.length} agents have been deleted: ${agentNames}`,
    })
  }, [agents, selectedAgents])

  const handleBatchStatusChange = useCallback(
    (status: "Active" | "Maintenance" | "Offline") => {
      if (selectedAgents.length === 0) return

      const now = new Date()
      setAgents((prev) =>
        prev.map((agent) => {
          if (selectedAgents.includes(agent.id)) {
            return {
              ...agent,
              status,
              lastModified: now,
              history: [
                ...(agent.history || []),
                {
                  date: now,
                  action: "Status Changed",
                  details: `Status changed to ${status} in batch operation`,
                },
              ],
            }
          }
          return agent
        }),
      )

      toast.success("Status updated", {
        description: `${selectedAgents.length} agents updated to ${status} status`,
      })
      setSelectedAgents([])
      setIsSelectMode(false)
    },
    [selectedAgents],
  )

  const toggleAgentSelection = useCallback((agentId: number) => {
    setSelectedAgents((prev) => (prev.includes(agentId) ? prev.filter((id) => id !== agentId) : [...prev, agentId]))
  }, [])

  const toggleSelectAll = useCallback(() => {
    if (selectedAgents.length === filteredAndSortedAgents.length) {
      setSelectedAgents([])
    } else {
      setSelectedAgents(filteredAndSortedAgents.map((agent) => agent.id))
    }
  }, [selectedAgents.length, filteredAndSortedAgents])

  const toggleFavorite = useCallback((agentId: number) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === agentId) {
          const now = new Date()
          return {
            ...agent,
            favorited: !agent.favorited,
            lastModified: now,
            history: [
              ...(agent.history || []),
              {
                date: now,
                action: agent.favorited ? "Unfavorited" : "Favorited",
                details: agent.favorited ? "Removed from favorites" : "Added to favorites",
              },
            ],
          }
        }
        return agent
      }),
    )
  }, [])

  const incrementUsage = useCallback((agentId: number) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === agentId) {
          const now = new Date()
          return {
            ...agent,
            usageCount: (agent.usageCount || 0) + 1,
            lastActive: now,
            lastModified: now,
            history: [
              ...(agent.history || []),
              {
                date: now,
                action: "Used",
                details: `Agent was used. Total usage: ${(agent.usageCount || 0) + 1}`,
              },
            ],
          }
        }
        return agent
      }),
    )

    toast.success("Agent activated", {
      description: "Usage count incremented and timestamp updated",
    })
  }, [])

  const duplicateAgent = useCallback((agent: Agent) => {
    const now = new Date()
    const newAgent: Agent = {
      ...agent,
      id: Date.now(),
      name: `${agent.name} (Copy)`,
      createdAt: now,
      lastActive: now,
      lastModified: now,
      usageCount: 0,
      history: [
        {
          date: now,
          action: "Created",
          details: `Agent created as a copy of ${agent.name}`,
        },
      ],
    }

    setAgents((prev) => [...prev, newAgent])
    toast.success("Agent duplicated", {
      description: `${agent.name} has been duplicated as ${newAgent.name}`,
    })
  }, [])

  const exportAgents = useCallback(() => {
    try {
      const dataStr = JSON.stringify(agents, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `agents-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Agents exported", {
        description: `${agents.length} agents exported successfully.`,
      })
    } catch (err) {
      console.error("Error exporting agents:", err)
      toast.error("Export failed", {
        description: "There was a problem exporting your agents.",
      })
    }
  }, [agents])

  const exportSelectedAgents = useCallback(() => {
    try {
      if (selectedAgents.length === 0) {
        toast.error("No agents selected", {
          description: "Please select agents to export",
        })
        return
      }

      const selectedAgentsData = agents.filter((agent) => selectedAgents.includes(agent.id))
      const dataStr = JSON.stringify(selectedAgentsData, null, 2)
      const dataBlob = new Blob([dataStr], { type: "application/json" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `selected-agents-${new Date().toISOString().split("T")[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Selected agents exported", {
        description: `${selectedAgents.length} agents exported successfully.`,
      })
      setSelectedAgents([])
      setIsSelectMode(false)
    } catch (err) {
      console.error("Error exporting selected agents:", err)
      toast.error("Export failed", {
        description: "There was a problem exporting your selected agents.",
      })
    }
  }, [agents, selectedAgents])

  const exportAsCSV = useCallback(() => {
    try {
      // Create CSV header
      const headers = [
        "id",
        "name",
        "description",
        "status",
        "type",
        "createdAt",
        "lastActive",
        "performance",
        "capabilities",
        "tags",
        "usageCount",
        "favorited",
        "priority",
        "category",
      ]

      // Convert agents to CSV rows
      const rows = agents.map((agent) => [
        agent.id,
        `"${agent.name.replace(/"/g, '""')}"`,
        `"${agent.description.replace(/"/g, '""')}"`,
        agent.status,
        agent.type,
        agent.createdAt.toISOString(),
        agent.lastActive?.toISOString() || "",
        agent.performance || 0,
        `"${(agent.capabilities || []).join(", ").replace(/"/g, '""')}"`,
        `"${(agent.tags || []).join(", ").replace(/"/g, '""')}"`,
        agent.usageCount || 0,
        agent.favorited ? "Yes" : "No",
        agent.priority || "Medium",
        agent.category || "",
      ])

      // Combine header and rows
      const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

      // Create and download the file
      const dataBlob = new Blob([csvContent], { type: "text/csv" })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement("a")
      link.href = url
      link.download = `agents-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success("Agents exported as CSV", {
        description: `${agents.length} agents exported successfully.`,
      })
    } catch (err) {
      console.error("Error exporting agents as CSV:", err)
      toast.error("CSV export failed", {
        description: "There was a problem exporting your agents as CSV.",
      })
    }
  }, [agents])

  const resetFilters = useCallback(() => {
    setSearchTerm("")
    setFilterStatus("all")
    setFilterType("all")
    setFilterCategory("all")
    setFilterPriority("all")
    setSortOrder("desc")
    setSortField("createdAt")
    setActiveTab("all")
    toast.success("Filters reset", {
      description: "All filters have been reset to default values.",
    })
  }, [])

  const getAgentAnalytics = useCallback((): AgentAnalytics => {
    const totalAgents = agents.length
    const activeAgents = agents.filter((agent) => agent.status === "Active").length
    const totalUsage = agents.reduce((sum, agent) => sum + (agent.usageCount || 0), 0)

    const performances = agents.map((agent) => agent.performance || 0)
    const averagePerformance = performances.length
      ? Math.round(performances.reduce((sum, perf) => sum + perf, 0) / performances.length)
      : 0

    const topPerformer = agents.length
      ? [...agents].sort((a, b) => (b.performance || 0) - (a.performance || 0))[0]
      : undefined

    // Count agents with activity in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recentActivity = agents.filter((agent) => agent.lastActive && agent.lastActive > oneDayAgo).length

    // Calculate type distribution
    const typeDistribution: Record<string, number> = {}
    agents.forEach((agent) => {
      typeDistribution[agent.type] = (typeDistribution[agent.type] || 0) + 1
    })

    // Calculate status distribution
    const statusDistribution: Record<string, number> = {}
    agents.forEach((agent) => {
      statusDistribution[agent.status] = (statusDistribution[agent.status] || 0) + 1
    })

    return {
      totalAgents,
      activeAgents,
      totalUsage,
      averagePerformance,
      topPerformer,
      recentActivity,
      typeDistribution,
      statusDistribution,
    }
  }, [agents])

  const handleUseTemplate = useCallback(
    (template: any) => {
      setFormData({
        ...INITIAL_FORM_STATE,
        name: template.name,
        description: template.description,
        type: template.type as any,
        capabilities: template.capabilities,
        category: template.category,
      })
      updatePreviewAvatar(template.name)
      setShowTemplatesDialog(false)
      setShowCreateDialog(true)
      toast.success("Template loaded", {
        description: `${template.name} template has been loaded into the form.`,
      })
    },
    [INITIAL_FORM_STATE, updatePreviewAvatar],
  )

  const renderAgentCard = useCallback(
    (agent: Agent) => {
      const StatusIcon = AGENT_STATUSES[agent.status].icon
      const TypeIcon = AGENT_TYPES[agent.type].icon

      return (
        <motion.div key={agent.id} initial="hidden" animate="visible" whileHover="hover" variants={cardVariants} layout>
          <Card
            className={`bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-violet-700 transition-colors shadow-lg ${
              selectedAgents.includes(agent.id) ? "ring-2 ring-violet-500" : ""
            } mb-6 overflow-hidden`}
          >
            <CardHeader className="pb-5 pt-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-5">
                  {isSelectMode && (
                    <div className="flex items-center mr-2">
                      <input
                        type="checkbox"
                        checked={selectedAgents.includes(agent.id)}
                        onChange={() => toggleAgentSelection(agent.id)}
                        className="h-5 w-5 rounded border-gray-600 text-violet-600 focus:ring-violet-500"
                        aria-label={`Select ${agent.name}`}
                      />
                    </div>
                  )}
                  {agent.avatarUrl ? (
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full blur-md opacity-20"></div>
                      <div className="relative h-20 w-20 rounded-full overflow-hidden border-3 border-gray-800 shadow-xl">
                        {agent.avatarUrl.startsWith("data:") || agent.avatarUrl.startsWith("http") ? (
                          <Image
                            src={agent.avatarUrl || "/placeholder.svg"}
                            alt={`${agent.name} Avatar`}
                            width={80}
                            height={80}
                            className="object-cover"
                            priority
                          />
                        ) : (
                          <div dangerouslySetInnerHTML={{ __html: agent.avatarUrl }} className="h-full w-full" />
                        )}
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 rounded-full p-1.5 ${AGENT_STATUSES[agent.status].bgColor} border-2 border-gray-900 z-20`}
                      >
                        <StatusIcon className={`w-4 h-4 ${AGENT_STATUSES[agent.status].color}`} />
                      </div>
                    </div>
                  ) : (
                    <Skeleton className="h-16 w-16 rounded-full" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-2xl font-bold text-white">{agent.name}</CardTitle>
                      {agent.favorited && (
                        <motion.div
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 500, damping: 15 }}
                        >
                          <Star className="h-5 w-5 text-amber-400 fill-amber-400" />
                        </motion.div>
                      )}
                    </div>
                    <CardDescription className="text-gray-300 flex items-center gap-1 text-base">
                      <TypeIcon className={`w-4 h-4 ${AGENT_TYPES[agent.type].color}`} />
                      {AGENT_TYPES[agent.type].label}
                      {agent.version && <span className="ml-1">v{agent.version}</span>}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 rounded-full hover:bg-gray-800"
                        aria-label="Agent options"
                      >
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-64 bg-gray-900 border border-gray-800" align="end">
                      <div className="grid gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start hover:bg-gray-800"
                          onClick={() => incrementUsage(agent.id)}
                        >
                          <Zap className="mr-2 h-4 w-4 text-violet-400" />
                          Activate Agent
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start hover:bg-gray-800"
                          onClick={() => toggleFavorite(agent.id)}
                        >
                          {agent.favorited ? (
                            <>
                              <Star className="mr-2 h-4 w-4 fill-amber-400 text-amber-400" />
                              Remove from Favorites
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4 text-gray-400" />
                              Add to Favorites
                            </>
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="justify-start hover:bg-gray-800"
                          onClick={() => duplicateAgent(agent)}
                        >
                          <Copy className="mr-2 h-4 w-4 text-cyan-400" />
                          Duplicate
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="justify-start hover:bg-gray-800">
                              <History className="mr-2 h-4 w-4 text-teal-400" />
                              View History
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md bg-gray-900 border border-gray-800">
                            <DialogHeader>
                              <DialogTitle className="text-xl text-white">Agent History</DialogTitle>
                            </DialogHeader>
                            <ScrollArea className="h-[300px] pr-4">
                              {agent.history && agent.history.length > 0 ? (
                                <div className="space-y-4">
                                  {agent.history
                                    .sort((a, b) => b.date.getTime() - a.date.getTime())
                                    .map((entry, i) => (
                                      <div key={i} className="border-b border-gray-800 pb-3 last:border-0">
                                        <div className="flex justify-between">
                                          <span className="font-medium text-white">{entry.action}</span>
                                          <span className="text-sm text-gray-500">{formatTimeAgo(entry.date)}</span>
                                        </div>
                                        {entry.details && <p className="text-sm text-gray-400 mt-1">{entry.details}</p>}
                                      </div>
                                    ))}
                                </div>
                              ) : (
                                <p className="text-center text-gray-500 py-4">No history available</p>
                              )}
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Separator className="my-2 bg-gray-800" />
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-rose-400 hover:text-rose-300 hover:bg-gray-800 w-full"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete Agent
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-gray-900 border border-gray-800">
                          <DialogHeader>
                            <DialogTitle className="text-white">Confirm Deletion</DialogTitle>
                          </DialogHeader>
                          <p className="text-gray-300">
                            Are you sure you want to delete <strong className="text-white">{agent.name}</strong>? This
                            action cannot be undone.
                          </p>
                          <div className="flex justify-end gap-2 mt-4">
                            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800">
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={() => handleDeleteAgent(agent.id, agent.name)}>
                              Delete
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </PopoverContent>
                  </Popover>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-gray-800 hover:bg-gray-700 border-gray-700 text-white"
                        aria-label={`Edit ${agent.name}`}
                      >
                        <Settings2 className="w-4 h-4 mr-2 text-violet-400" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-gray-900 border border-gray-800 max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="text-2xl flex items-center gap-2 text-white">
                          <Bot className="w-6 h-6 text-violet-400" />
                          Edit Agent
                        </DialogTitle>
                      </DialogHeader>
                      <EditAgentForm
                        agent={agent}
                        onUpdate={handleUpdateAgent}
                        onDelete={handleDeleteAgent}
                        agentTypes={AGENT_TYPES}
                        agentStatuses={AGENT_STATUSES}
                        agentPriorities={AGENT_PRIORITIES}
                        categories={SAMPLE_CATEGORIES}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-6 pt-3">
              <p className="text-gray-300 text-base line-clamp-2 mb-4">{agent.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {agent.capabilities.slice(0, 3).map((capability, index) => (
                  <Badge key={index} variant="secondary" className="text-sm py-1 px-3 bg-gray-800 text-gray-300">
                    {capability}
                  </Badge>
                ))}
                {agent.capabilities.length > 3 && (
                  <Badge variant="secondary" className="text-sm py-1 px-3 bg-gray-800 text-gray-300">
                    +{agent.capabilities.length - 3} more
                  </Badge>
                )}
              </div>

              {agent.tags && agent.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {agent.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-sm border-gray-700 text-gray-300">
                      #{tag}
                    </Badge>
                  ))}
                  {agent.tags.length > 3 && (
                    <Badge variant="outline" className="text-sm border-gray-700 text-gray-300">
                      +{agent.tags.length - 3} more
                    </Badge>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-sm text-gray-300 mt-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-violet-400" />
                  {agent.lastActive ? (
                    <span>Active {formatTimeAgo(agent.lastActive)}</span>
                  ) : (
                    <span>Created {formatTimeAgo(agent.createdAt)}</span>
                  )}
                </div>

                <div className="flex items-center gap-2 justify-end">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>Uses: {agent.usageCount || 0}</span>
                </div>

                {agent.priority && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        AGENT_PRIORITIES[agent.priority as keyof typeof AGENT_PRIORITIES].bgColor
                      } ${AGENT_PRIORITIES[agent.priority as keyof typeof AGENT_PRIORITIES].color}`}
                    >
                      {agent.priority} Priority
                    </span>
                  </div>
                )}

                {agent.performance !== undefined && (
                  <div className="flex items-center gap-2 justify-end">
                    <span>Performance: {agent.performance}%</span>
                    <div className="w-20 h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getPerformanceColor(agent.performance)} transition-all duration-500`}
                        style={{ width: `${agent.performance}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )
    },
    [
      handleUpdateAgent,
      handleDeleteAgent,
      selectedAgents,
      isSelectMode,
      toggleAgentSelection,
      incrementUsage,
      toggleFavorite,
      duplicateAgent,
    ],
  )

  const renderAgentTemplates = useCallback(() => {
    const templates = [
      {
        name: "Customer Support Assistant",
        description: "AI agent designed to handle customer inquiries and support tickets",
        type: "Assistant",
        capabilities: ["Natural Language Processing", "Knowledge Base", "Multi-language Support"],
        category: "Customer Support",
      },
      {
        name: "Data Analysis Engine",
        description: "Powerful agent for processing and analyzing large datasets",
        type: "Analyzer",
        capabilities: ["Data Analysis", "Predictive Analytics", "Visualization"],
        category: "Analytics",
      },
      {
        name: "Content Creation Assistant",
        description: "Creative agent that helps generate and optimize content",
        type: "Assistant",
        capabilities: ["Natural Language Processing", "Content Generation", "SEO Optimization"],
        category: "Content Creation",
      },
      {
        name: "Workflow Automation Agent",
        description: "Agent that automates repetitive tasks and workflows",
        type: "Processor",
        capabilities: ["Task Automation", "Workflow Management", "Integration"],
        category: "Automation",
      },
    ]

    return (
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6"
      >
        {templates.map((template, index) => (
          <motion.div key={index} variants={cardVariants} whileHover="hover">
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 hover:border-violet-700 transition-all shadow-md overflow-hidden">
              <CardHeader className="pb-4 pt-7">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-violet-500 opacity-10"></div>
                    {(() => {
                      const TypeIcon = AGENT_TYPES[template.type as keyof typeof AGENT_TYPES].icon
                      return (
                        <TypeIcon
                          className={`w-8 h-8 ${AGENT_TYPES[template.type as keyof typeof AGENT_TYPES].color} relative z-10`}
                        />
                      )
                    })()}
                  </div>
                  <div>
                    <CardTitle className="text-xl text-white">{template.name}</CardTitle>
                    <CardDescription className="text-gray-300">
                      {AGENT_TYPES[template.type as keyof typeof AGENT_TYPES].label}
                    </CardDescription>
                  </div>
                </div>
                <p className="text-gray-300 mt-2">{template.description}</p>
              </CardHeader>
              <CardContent className="pb-5 pt-2">
                <div className="flex flex-wrap gap-2 mb-4">
                  {template.capabilities.map((capability, idx) => (
                    <Badge key={idx} variant="secondary" className="text-sm py-1 px-3 bg-gray-800 text-gray-300">
                      {capability}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300 mt-3">
                  <Folder className="w-4 h-4 text-violet-400" />
                  <span>Category: {template.category}</span>
                </div>
              </CardContent>
              <CardFooter className="pt-2 pb-5 border-t border-gray-800">
                <Button
                  className="w-full bg-violet-700 hover:bg-violet-600 text-white"
                  onClick={() => handleUseTemplate(template)}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Use Template
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    )
  }, [handleUseTemplate])

  const renderAnalytics = useCallback(() => {
    const analytics = getAgentAnalytics()

    return (
      <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="space-y-6">
        <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Agents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analytics.totalAgents}</div>
              <p className="text-xs text-gray-400 mt-1">
                {analytics.activeAgents} active (
                {Math.round((analytics.activeAgents / analytics.totalAgents) * 100) || 0}%)
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Usage</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analytics.totalUsage}</div>
              <p className="text-xs text-gray-400 mt-1">{analytics.recentActivity} agents used in last 24h</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Avg. Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{analytics.averagePerformance}%</div>
              <div className="w-full h-2 bg-gray-800 dark:bg-gray-700 rounded-full mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${analytics.averagePerformance}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-full ${getPerformanceColor(analytics.averagePerformance)} rounded-full`}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Top Performer</CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.topPerformer ? (
                <div>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold truncate text-white">{analytics.topPerformer.name}</div>
                    <div className="text-sm font-medium text-emerald-400">{analytics.topPerformer.performance}%</div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {analytics.topPerformer.usageCount || 0} uses • {analytics.topPerformer.type}
                  </p>
                </div>
              ) : (
                <div className="text-gray-400">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">Agent Types</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(analytics.typeDistribution).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(analytics.typeDistribution).map(([type, count]) => (
                    <div key={type} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          {(() => {
                            const TypeIcon = AGENT_TYPES[type as keyof typeof AGENT_TYPES].icon
                            return (
                              <TypeIcon
                                className={`w-4 h-4 mr-2 ${AGENT_TYPES[type as keyof typeof AGENT_TYPES].color}`}
                              />
                            )
                          })()}
                          <span className="text-white">{AGENT_TYPES[type as keyof typeof AGENT_TYPES].label}</span>
                        </div>
                        <div className="text-gray-300">
                          {count} ({Math.round((count / analytics.totalAgents) * 100)}%)
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / analytics.totalAgents) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${AGENT_TYPES[type as keyof typeof AGENT_TYPES].bgColor} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No data available</div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800">
            <CardHeader>
              <CardTitle className="text-lg text-white">Agent Status</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(analytics.statusDistribution).length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(analytics.statusDistribution).map(([status, count]) => (
                    <div key={status} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <div className="flex items-center">
                          {(() => {
                            const StatusIcon = AGENT_STATUSES[status as keyof typeof AGENT_STATUSES].icon
                            return (
                              <StatusIcon
                                className={`w-4 h-4 mr-2 ${AGENT_STATUSES[status as keyof typeof AGENT_STATUSES].color}`}
                              />
                            )
                          })()}
                          <span className="text-white">{status}</span>
                        </div>
                        <div className="text-gray-300">
                          {count} ({Math.round((count / analytics.totalAgents) * 100)}%)
                        </div>
                      </div>
                      <div className="w-full h-2 bg-gray-800 rounded-full">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(count / analytics.totalAgents) * 100}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                          className={`h-full ${AGENT_STATUSES[status as keyof typeof AGENT_STATUSES].bgColor} rounded-full`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">No data available</div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    )
  }, [getAgentAnalytics])

  const renderAgentForm = () => (
    <form onSubmit={handleCreateAgent} className="space-y-4">
      {error && (
        <div className="p-3 bg-rose-900/30 border border-rose-800 rounded-md text-rose-300 text-sm" role="alert">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="name" className="text-sm font-medium text-gray-300">
          Agent Name*
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          className="mt-1 bg-gray-800 border-gray-700 text-white"
          placeholder="Enter agent name"
          required
          aria-required="true"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium text-gray-300">
          Description*
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          className="mt-1 bg-gray-800 border-gray-700 text-white"
          placeholder="Enter agent description"
          required
          aria-required="true"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="status" className="text-sm font-medium text-gray-300">
            Status
          </Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
            <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {Object.entries(AGENT_STATUSES).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="type" className="text-sm font-medium text-gray-300">
            Type
          </Label>
          <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
            <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {Object.entries(AGENT_TYPES).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority" className="text-sm font-medium text-gray-300">
            Priority
          </Label>
          <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
            <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {Object.entries(AGENT_PRIORITIES).map(([value, { label }]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category" className="text-sm font-medium text-gray-300">
            Category
          </Label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
            <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700">
              {SAMPLE_CATEGORIES.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="version" className="text-sm font-medium text-gray-300">
          Version
        </Label>
        <Input
          id="version"
          value={formData.version}
          onChange={(e) => handleInputChange("version", e.target.value)}
          className="mt-1 bg-gray-800 border-gray-700 text-white"
          placeholder="1.0.0"
        />
      </div>

      <div>
        <Label htmlFor="schedule" className="text-sm font-medium text-gray-300">
          Schedule (Optional)
        </Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal mt-1 bg-gray-800 border-gray-700 text-white"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {selectedDate ? format(selectedDate, "PPP") : "Select date"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 bg-gray-900 border-gray-700">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
              className="bg-gray-900"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <Label htmlFor="capabilities" className="text-sm font-medium text-gray-300">
          Capabilities
        </Label>
        <div className="flex mt-1 mb-2">
          <Input
            id="capabilities"
            value={newCapability}
            onChange={(e) => setNewCapability(e.target.value)}
            placeholder="Add capability"
            className="rounded-r-none bg-gray-800 border-gray-700 text-white"
          />
          <Button type="button" onClick={addCapability} className="rounded-l-none" variant="secondary">
            Add
          </Button>
        </div>

        {formData.capabilities.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {formData.capabilities.map((capability, index) => (
              <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-gray-800 text-gray-300">
                {capability}
                <X
                  className="w-3 h-3 cursor-pointer hover:text-rose-400"
                  onClick={() => removeCapability(capability)}
                />
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-1">No capabilities added. Default capabilities will be assigned.</p>
        )}
      </div>

      <div>
        <Label htmlFor="tags" className="text-sm font-medium text-gray-300">
          Tags
        </Label>
        <div className="flex mt-1 mb-2">
          <Input
            id="tags"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add tag"
            className="rounded-r-none bg-gray-800 border-gray-700 text-white"
          />
          <Button type="button" onClick={addTag} className="rounded-l-none" variant="secondary">
            Add
          </Button>
        </div>

        {formData.tags && formData.tags.length > 0 ? (
          <div className="flex flex-wrap gap-1 mt-2">
            {formData.tags.map((tag, index) => (
              <Badge key={index} variant="outline" className="flex items-center gap-1 border-gray-700 text-gray-300">
                #{tag}
                <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => removeTag(tag)} />
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-1">No tags added. Tags help categorize your agents.</p>
        )}
      </div>

      <div>
        <Label htmlFor="notes" className="text-sm font-medium text-gray-300">
          Notes (Optional)
        </Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
          className="mt-1 bg-gray-800 border-gray-700 text-white"
          placeholder="Additional notes about this agent"
        />
      </div>

      <div>
        <Label htmlFor="avatar" className="text-sm font-medium text-gray-300">
          Upload Avatar (Optional)
        </Label>
        <Input
          id="avatar"
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="mt-1 bg-gray-800 border-gray-700 text-white"
          accept="image/*"
          aria-label="Upload agent avatar"
        />
        <p className="text-xs text-gray-400 mt-1">
          Max file size: 5MB. If no avatar is uploaded, one will be generated.
        </p>
      </div>

      <div className="pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-500 hover:to-violet-700 text-white font-medium"
          aria-busy={loading}
        >
          {loading ? (
            <div className="flex items-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
              </motion.div>
              Creating...
            </div>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Create Agent
            </>
          )}
        </Button>
      </div>
    </form>
  )

  return (
    <main className="min-h-screen bg-black text-gray-100" role="main">
      <Container className="py-12 max-w-7xl">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-fuchsia-500">
                NeuralOps AI: Agent Management
              </h1>
              <p className="text-lg text-gray-300 max-w-3xl">
                Build, customize, and deploy intelligent AI agents that revolutionize your workflows.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
                className="bg-gray-900 border-gray-800"
              >
                {theme === "dark" ? <Sun className="h-5 w-5 text-amber-300" /> : <Moon className="h-5 w-5" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsSelectMode(!isSelectMode)
                  if (isSelectMode) {
                    setSelectedAgents([])
                  }
                }}
                className="bg-gray-900 border-gray-800"
              >
                {isSelectMode ? (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel Selection
                  </>
                ) : (
                  <>
                    <Checkbox className="w-4 h-4 mr-2" />
                    Select Agents
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.header>

        <div className="grid grid-cols-1 gap-10">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 shadow-md overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <CardTitle className="text-xl flex items-center gap-2 text-white">
                    <Bot className="w-5 h-5 text-violet-400" />
                    Your AI Agents ({filteredAndSortedAgents.length})
                  </CardTitle>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setShowCreateDialog(true)}
                      className="bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-500 hover:to-violet-700 text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Create Agent
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowTemplatesDialog(true)}
                      className="text-xs bg-gray-900 border-gray-800"
                    >
                      <FolderPlus className="w-4 h-4 mr-1 text-violet-400" />
                      Templates
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode("list")}
                      className={`text-xs ${viewMode === "list" ? "bg-gray-800 border-violet-700" : "bg-gray-900 border-gray-800"}`}
                    >
                      <PanelLeft className="w-3.5 h-3.5 mr-1" />
                      List
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode("grid")}
                      className={`text-xs ${viewMode === "grid" ? "bg-gray-800 border-violet-700" : "bg-gray-900 border-gray-800"}`}
                    >
                      <Layers className="w-3.5 h-3.5 mr-1" />
                      Grid
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setViewMode("analytics")}
                      className={`text-xs ${viewMode === "analytics" ? "bg-gray-800 border-violet-700" : "bg-gray-900 border-gray-800"}`}
                    >
                      <BarChart2 className="w-3.5 h-3.5 mr-1" />
                      Analytics
                    </Button>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="text-xs bg-gray-900 border-gray-800">
                          <Download className="w-3.5 h-3.5 mr-1" />
                          Export
                          <ChevronDown className="w-3.5 h-3.5 ml-1" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48 bg-gray-900 border-gray-800" align="end">
                        <div className="grid gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={exportAgents}
                            disabled={agents.length === 0}
                            className="justify-start hover:bg-gray-800"
                          >
                            <FileText className="w-3.5 h-3.5 mr-2" />
                            Export as JSON
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={exportAsCSV}
                            disabled={agents.length === 0}
                            className="justify-start hover:bg-gray-800"
                          >
                            <FileText className="w-3.5 h-3.5 mr-2" />
                            Export as CSV
                          </Button>
                          {isSelectMode && selectedAgents.length > 0 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={exportSelectedAgents}
                              className="justify-start hover:bg-gray-800"
                            >
                              <Clipboard className="w-3.5 h-3.5 mr-2" />
                              Export Selected
                            </Button>
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>

                    <div className="relative">
                      <Input
                        type="file"
                        id="import-agents"
                        className="hidden"
                        accept=".json"
                        ref={importFileRef}
                        onChange={importAgents}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => importFileRef.current?.click()}
                        className="text-xs bg-gray-900 border-gray-800"
                      >
                        <Upload className="w-3.5 h-3.5 mr-1" />
                        Import
                      </Button>
                    </div>
                  </div>
                </div>

                {viewMode !== "analytics" && (
                  <>
                    <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mt-2">
                      <TabsList className="grid grid-cols-5 mb-4 bg-gray-900">
                        <TabsTrigger value="all" className="data-[state=active]:bg-gray-800">
                          All
                        </TabsTrigger>
                        <TabsTrigger value="active" className="text-emerald-400 data-[state=active]:bg-gray-800">
                          Active
                        </TabsTrigger>
                        <TabsTrigger value="maintenance" className="text-amber-400 data-[state=active]:bg-gray-800">
                          Maintenance
                        </TabsTrigger>
                        <TabsTrigger value="offline" className="text-rose-400 data-[state=active]:bg-gray-800">
                          Offline
                        </TabsTrigger>
                        <TabsTrigger value="favorites" className="text-amber-400 data-[state=active]:bg-gray-800">
                          Favorites
                        </TabsTrigger>
                      </TabsList>

                      <div className="flex flex-col sm:flex-row gap-3 mb-2">
                        <div className="flex-1 relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                          <Input
                            placeholder="Search agents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 bg-gray-800 border-gray-700 text-white"
                          />
                        </div>

                        <div className="flex gap-2 flex-wrap">
                          <Select value={filterStatus} onValueChange={setFilterStatus}>
                            <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700 text-white">
                              <Filter className="w-3.5 h-3.5 mr-2" />
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="all">All Status</SelectItem>
                              {Object.entries(AGENT_STATUSES).map(([value]) => (
                                <SelectItem key={value} value={value}>
                                  {value}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[130px] bg-gray-800 border-gray-700 text-white">
                              <Tag className="w-3.5 h-3.5 mr-2" />
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="all">All Types</SelectItem>
                              {Object.entries(AGENT_TYPES).map(([value, { label }]) => (
                                <SelectItem key={value} value={value}>
                                  {label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
                            className="aspect-square bg-gray-800 border-gray-700"
                          >
                            {sortOrder === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
                          </Button>
                        </div>
                      </div>

                      {isSelectMode && selectedAgents.length > 0 && (
                        <div className="bg-violet-900/20 border border-violet-800 rounded-md p-2 mb-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedAgents.length === filteredAndSortedAgents.length}
                                onChange={toggleSelectAll}
                                className="h-4 w-4 rounded border-gray-600 text-violet-600 focus:ring-violet-500"
                              />
                              <span className="text-sm font-medium text-white">
                                {selectedAgents.length} agent{selectedAgents.length !== 1 ? "s" : ""} selected
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button variant="outline" size="sm" className="text-xs bg-gray-800 border-gray-700">
                                    Set Status
                                    <ChevronDown className="w-3.5 h-3.5 ml-1" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-48 bg-gray-900 border-gray-700" align="end">
                                  <div className="grid gap-1">
                                    {Object.entries(AGENT_STATUSES).map(([status, { label, icon: Icon }]) => (
                                      <Button
                                        key={status}
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleBatchStatusChange(status as any)}
                                        className="justify-start hover:bg-gray-800"
                                      >
                                        <Icon className="w-3.5 h-3.5 mr-2" />
                                        Set to {label}
                                      </Button>
                                    ))}
                                  </div>
                                </PopoverContent>
                              </Popover>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={exportSelectedAgents}
                                className="text-xs bg-gray-800 border-gray-700"
                              >
                                <Download className="w-3.5 h-3.5 mr-1" />
                                Export
                              </Button>
                              <Button variant="destructive" size="sm" onClick={handleBatchDelete} className="text-xs">
                                <Trash2 className="w-3.5 h-3.5 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <Separator className="my-2 bg-gray-800" />

                      <TabsContent value="all" className="m-0">
                        <AgentList
                          agents={filteredAndSortedAgents}
                          renderAgentCard={renderAgentCard}
                          viewMode={viewMode}
                        />
                      </TabsContent>

                      <TabsContent value="active" className="m-0">
                        <AgentList
                          agents={filteredAndSortedAgents}
                          renderAgentCard={renderAgentCard}
                          viewMode={viewMode}
                        />
                      </TabsContent>

                      <TabsContent value="maintenance" className="m-0">
                        <AgentList
                          agents={filteredAndSortedAgents}
                          renderAgentCard={renderAgentCard}
                          viewMode={viewMode}
                        />
                      </TabsContent>

                      <TabsContent value="offline" className="m-0">
                        <AgentList
                          agents={filteredAndSortedAgents}
                          renderAgentCard={renderAgentCard}
                          viewMode={viewMode}
                        />
                      </TabsContent>

                      <TabsContent value="favorites" className="m-0">
                        <AgentList
                          agents={filteredAndSortedAgents}
                          renderAgentCard={renderAgentCard}
                          viewMode={viewMode}
                        />
                      </TabsContent>
                    </Tabs>
                  </>
                )}

                {viewMode === "analytics" && renderAnalytics()}
              </CardHeader>

              {viewMode !== "analytics" && (
                <CardFooter className="flex justify-between pt-2">
                  <Button variant="ghost" onClick={resetFilters} className="text-xs" size="sm">
                    <RefreshCw className="w-3.5 h-3.5 mr-1" />
                    Reset Filters
                  </Button>

                  <Select value={sortField} onValueChange={(value) => setSortField(value as any)}>
                    <SelectTrigger className="w-[160px] text-xs h-9 bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="createdAt">Sort by Date</SelectItem>
                      <SelectItem value="name">Sort by Name</SelectItem>
                      <SelectItem value="performance">Sort by Performance</SelectItem>
                      <SelectItem value="priority">Sort by Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </CardFooter>
              )}
            </Card>
          </motion.div>
        </div>

        <motion.footer
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-400">
            Powered by <span className="text-violet-400">NeuralOps AI</span> &copy; {new Date().getFullYear()}
          </p>
        </motion.footer>
      </Container>

      {/* Create Agent Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-white">
              <Plus className="w-6 h-6 text-violet-400" />
              Create New AI Agent
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">
            {previewAvatar && (
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full blur-md opacity-20"></div>
                  <div className="relative h-24 w-24 rounded-full overflow-hidden border-3 border-gray-800 shadow-xl">
                    {previewAvatar.startsWith("data:") || previewAvatar.startsWith("http") ? (
                      <Image
                        src={previewAvatar || "/placeholder.svg"}
                        alt="Agent Avatar Preview"
                        width={96}
                        height={96}
                        className="object-cover"
                        priority
                      />
                    ) : (
                      <div dangerouslySetInnerHTML={{ __html: previewAvatar }} className="h-full w-full" />
                    )}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 rounded-full p-1.5 ${
                      AGENT_STATUSES[formData.status as keyof typeof AGENT_STATUSES].bgColor
                    } border-2 border-gray-900 z-20`}
                  >
                    {(() => {
                      const StatusIcon = AGENT_STATUSES[formData.status as keyof typeof AGENT_STATUSES].icon
                      return (
                        <StatusIcon
                          className={`w-4 h-4 ${AGENT_STATUSES[formData.status as keyof typeof AGENT_STATUSES].color}`}
                        />
                      )
                    })()}
                  </div>
                </div>
              </div>
            )}

            {renderAgentForm()}
          </div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                resetForm()
                setShowCreateDialog(false)
              }}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplatesDialog} onOpenChange={setShowTemplatesDialog}>
        <DialogContent className="bg-gray-900 border border-gray-800 max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2 text-white">
              <FolderPlus className="w-6 h-6 text-violet-400" />
              Agent Templates
            </DialogTitle>
          </DialogHeader>

          <div className="mt-2">{renderAgentTemplates()}</div>

          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowTemplatesDialog(false)}
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Toaster richColors closeButton position="top-right" />
    </main>
  )
}

// Helper Components
const AgentList = ({
  agents,
  renderAgentCard,
  viewMode = "grid",
}: {
  agents: Agent[]
  renderAgentCard: (agent: Agent) => React.ReactNode
  viewMode?: "list" | "grid"
}) => {
  if (agents.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 text-gray-400"
      >
        <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No agents found. Create your first agent to get started!</p>
      </motion.div>
    )
  }

  return (
    <ScrollArea className="h-[650px] pr-4">
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "grid grid-cols-1 gap-6"}
      >
        {agents.map(renderAgentCard)}
      </motion.div>
    </ScrollArea>
  )
}

interface EditAgentFormProps {
  agent: Agent
  onUpdate: (agent: Agent) => void
  onDelete: (id: number, name: string) => void
  agentTypes: typeof AGENT_TYPES
  agentStatuses: typeof AGENT_STATUSES
  agentPriorities: typeof AGENT_PRIORITIES
  categories: string[]
}

const EditAgentForm = ({
  agent,
  onUpdate,
  onDelete,
  agentTypes,
  agentStatuses,
  agentPriorities,
  categories,
}: EditAgentFormProps) => {
  const [formData, setFormData] = useState({
    name: agent.name,
    description: agent.description,
    status: agent.status,
    type: agent.type,
    capabilities: [...agent.capabilities],
    tags: [...(agent.tags || [])],
    priority: agent.priority || "Medium",
    category: agent.category || "",
    version: agent.version || "1.0.0",
    notes: agent.notes || "",
  })
  const [newCapability, setNewCapability] = useState("")
  const [newTag, setNewTag] = useState("")
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const addCapability = () => {
    if (newCapability.trim() && !formData.capabilities.includes(newCapability.trim())) {
      setFormData((prev) => ({
        ...prev,
        capabilities: [...prev.capabilities, newCapability.trim()],
      }))
      setNewCapability("")
    }
  }

  const removeCapability = (capability: string) => {
    setFormData((prev) => ({
      ...prev,
      capabilities: prev.capabilities.filter((c) => c !== capability),
    }))
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()],
      }))
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const updatedAgent: Agent = {
      ...agent,
      ...formData,
      lastModified: new Date(),
    }
    onUpdate(updatedAgent)
  }

  return (
    <div className="mt-4">
      <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3 mb-4 bg-gray-900">
          <TabsTrigger value="general" className="data-[state=active]:bg-gray-800">
            General
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="data-[state=active]:bg-gray-800">
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="advanced" className="data-[state=active]:bg-gray-800">
            Advanced
          </TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="general" className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-sm font-medium text-white">
                Agent Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-sm font-medium text-white">
                Description
              </Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-status" className="text-sm font-medium text-white">
                  Status
                </Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {Object.entries(agentStatuses).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-type" className="text-sm font-medium text-white">
                  Type
                </Label>
                <Select value={formData.type} onValueChange={(value) => handleInputChange("type", value)}>
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {Object.entries(agentTypes).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priority" className="text-sm font-medium text-white">
                  Priority
                </Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange("priority", value)}>
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {Object.entries(agentPriorities).map(([value, { label }]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-category" className="text-sm font-medium text-white">
                  Category
                </Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                  <SelectTrigger className="mt-1 bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-version" className="text-sm font-medium text-white">
                Version
              </Label>
              <Input
                id="edit-version"
                value={formData.version}
                onChange={(e) => handleInputChange("version", e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="1.0.0"
              />
            </div>

            <div>
              <Label htmlFor="edit-notes" className="text-sm font-medium text-white">
                Notes
              </Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                className="mt-1 bg-gray-800 border-gray-700 text-white"
                placeholder="Additional notes about this agent"
              />
            </div>
          </TabsContent>

          <TabsContent value="capabilities" className="space-y-4">
            <div>
              <Label htmlFor="edit-capabilities" className="text-sm font-medium text-white">
                Capabilities
              </Label>
              <div className="flex mt-1">
                <Input
                  id="edit-capabilities"
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  placeholder="Add capability"
                  className="rounded-r-none bg-gray-800 border-gray-700 text-white"
                />
                <Button type="button" onClick={addCapability} className="rounded-l-none" variant="secondary">
                  Add
                </Button>
              </div>

              {formData.capabilities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.capabilities.map((capability, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1 bg-gray-800 text-white">
                      {capability}
                      <X
                        className="w-3 h-3 cursor-pointer hover:text-rose-400"
                        onClick={() => removeCapability(capability)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="edit-tags" className="text-sm font-medium text-white">
                Tags
              </Label>
              <div className="flex mt-1">
                <Input
                  id="edit-tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  className="rounded-r-none bg-gray-800 border-gray-700 text-white"
                />
                <Button type="button" onClick={addTag} className="rounded-l-none" variant="secondary">
                  Add
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1 border-gray-700 text-white">
                      #{tag}
                      <X className="w-3 h-3 cursor-pointer hover:text-rose-400" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-white">Favorite Status</Label>
                <p className="text-xs text-gray-400">Mark this agent as a favorite</p>
              </div>
              <Switch
                checked={agent.favorited}
                onCheckedChange={(checked) => {
                  const updatedAgent = {
                    ...agent,
                    favorited: checked,
                    lastModified: new Date(),
                  }
                  onUpdate(updatedAgent)
                }}
              />
            </div>

            <Separator className="bg-gray-800" />

            <div>
              <Label className="text-sm font-medium text-white">Usage Statistics</Label>
              <div className="mt-2 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Created:</span>
                  <span className="text-white">{agent.createdAt.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Active:</span>
                  <span className="text-white">{agent.lastActive?.toLocaleString() || "Never"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Modified:</span>
                  <span className="text-white">{agent.lastModified?.toLocaleString() || "Never"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Usage Count:</span>
                  <span className="text-white">{agent.usageCount || 0}</span>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-800" />

            <div>
              <Label className="text-sm font-medium text-rose-400">Danger Zone</Label>
              <p className="text-xs text-gray-400 mt-1 mb-2">These actions cannot be undone.</p>

              {!confirmDelete ? (
                <Button type="button" variant="destructive" onClick={() => setConfirmDelete(true)} className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Agent
                </Button>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-rose-400">
                    Are you sure you want to delete <strong className="text-white">{agent.name}</strong>?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => onDelete(agent.id, agent.name)}
                      className="flex-1"
                    >
                      Confirm Delete
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setConfirmDelete(false)}
                      className="flex-1 bg-gray-800 border-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-violet-800 hover:from-violet-500 hover:to-violet-700 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </form>
      </Tabs>
    </div>
  )
}

// Helper functions
const formatTimeAgo = (date: Date) => {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`

  return date.toLocaleDateString()
}

const getPerformanceColor = (performance: number) => {
  if (performance >= 80) return "bg-emerald-400"
  if (performance >= 50) return "bg-amber-400"
  return "bg-rose-400"
}

export default AgentCreationPage
