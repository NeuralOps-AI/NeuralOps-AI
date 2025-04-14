"use client"

import type React from "react"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  Bot,
  Plus,
  X,
  Settings,
  AlertCircle,
  Trash,
  Edit,
  Star,
  Filter,
  Cpu,
  Workflow,
  MessageSquare,
  Database,
  ChevronRight,
  BarChart,
  CheckCircle,
  Circle,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Shield,
  Sliders,
  ChevronLeft,
  Search,
  Command,
  Play,
  ArrowRight,
  ArrowDown,
  Cog,
  Code,
  Layers,
  Keyboard,
  Loader2,
  Sparkles,
  Save,
  Zap,
  Copy,
  MoreHorizontal,
  Power,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

interface Agent {
  id: number
  name: string
  description: string
  status: "Active" | "Maintenance" | "Offline"
  type: "Assistant" | "Processor" | "Analyzer"
  createdAt: Date
  avatarUrl: string
  capabilities?: string[]
  tags?: string[]
  version?: string
  priority?: "Low" | "Medium" | "High"
  favorited?: boolean
  usageCount?: number
  lastActive?: Date
  performance?: number
}

const AGENT_STATUSES = {
  Active: {
    label: "Active",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    icon: <CheckCircle className="h-3 w-3 text-emerald-400" />,
  },
  Maintenance: {
    label: "Maintenance",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10",
    icon: <RefreshCw className="h-3 w-3 text-amber-400" />,
  },
  Offline: {
    label: "Offline",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    icon: <Circle className="h-3 w-3 text-rose-400" />,
  },
}

const AGENT_TYPES = {
  Assistant: {
    label: "AI Assistant",
    description: "Handles user interactions and queries",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    icon: <MessageSquare className="h-3 w-3" />,
    fullIcon: <MessageSquare className="h-4 w-4 text-sky-400" />,
  },
  Processor: {
    label: "Data Processor",
    description: "Processes and transforms data",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10",
    icon: <Database className="h-3 w-3" />,
    fullIcon: <Database className="h-4 w-4 text-violet-400" />,
  },
  Analyzer: {
    label: "Data Analyzer",
    description: "Analyzes and generates insights",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    icon: <Cpu className="h-3 w-3" />,
    fullIcon: <Cpu className="h-4 w-4 text-emerald-400" />,
  },
}

const AGENT_PRIORITIES = {
  Low: {
    label: "Low",
    color: "text-gray-400",
    bgColor: "bg-gray-500/10",
    icon: <Sliders className="h-3 w-3 text-gray-400" />,
  },
  Medium: {
    label: "Medium",
    color: "text-sky-400",
    bgColor: "bg-sky-500/10",
    icon: <Sliders className="h-3 w-3 text-sky-400" />,
  },
  High: {
    label: "High",
    color: "text-rose-400",
    bgColor: "bg-rose-500/10",
    icon: <Sliders className="h-3 w-3 text-rose-400" />,
  },
}

const AGENT_TEMPLATES = [
  {
    name: "Customer Support Assistant",
    description: "AI agent designed to handle customer inquiries and support tickets",
    type: "Assistant",
    status: "Active",
    capabilities: ["Natural Language Processing", "Knowledge Base", "Multi-language Support"],
    tags: ["support", "customer service", "help desk"],
    priority: "Medium",
    version: "1.0.0",
    icon: <MessageSquare className="h-4 w-4 text-sky-400" />,
  },
  {
    name: "Data Analysis Engine",
    description: "Powerful agent for processing and analyzing large datasets",
    type: "Analyzer",
    status: "Active",
    capabilities: ["Data Analysis", "Predictive Analytics", "Visualization"],
    tags: ["analytics", "data", "insights"],
    priority: "High",
    version: "2.1.0",
    icon: <BarChart className="h-4 w-4 text-emerald-400" />,
  },
  {
    name: "Content Creation Assistant",
    description: "Creative agent that helps generate and optimize content",
    type: "Assistant",
    status: "Active",
    capabilities: ["Natural Language Processing", "Content Generation", "SEO Optimization"],
    tags: ["content", "creation", "writing"],
    priority: "Medium",
    version: "1.5.0",
    icon: <Lightbulb className="h-4 w-4 text-sky-400" />,
  },
  {
    name: "Workflow Automation Agent",
    description: "Agent that automates repetitive tasks and workflows",
    type: "Processor",
    status: "Active",
    capabilities: ["Task Automation", "Workflow Management", "Integration"],
    tags: ["automation", "workflow", "productivity"],
    priority: "High",
    version: "3.0.0",
    icon: <Workflow className="h-4 w-4 text-violet-400" />,
  },
]

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

const KEYBOARD_SHORTCUTS = [
  { key: "k", modifier: "ctrl", description: "Open command palette" },
  { key: "n", modifier: "ctrl", description: "Create new agent" },
  { key: "f", modifier: "ctrl", description: "Search agents" },
  { key: "1-5", modifier: "alt", description: "Switch between tabs" },
  { key: "e", modifier: "ctrl", description: "Edit selected agent" },
  { key: "d", modifier: "ctrl", description: "Delete selected agent" },
  { key: "s", modifier: "ctrl", description: "Save changes" },
  { key: "esc", description: "Close dialogs" },
]

interface TemplateCardProps {
  template: (typeof AGENT_TEMPLATES)[0]
  onUse: (template: (typeof AGENT_TEMPLATES)[0]) => void
  isCreating: boolean
}

function TemplateCard({ template, onUse, isCreating }: TemplateCardProps) {
  return (
    <Card className="bg-black border border-gray-800 overflow-hidden">
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center gap-2">
          <div className={`p-1.5 rounded-sm ${AGENT_TYPES[template.type as keyof typeof AGENT_TYPES].bgColor}`}>
            {template.icon}
          </div>
          <div>
            <CardTitle className="text-xs font-medium text-white">{template.name}</CardTitle>
            <CardDescription className="text-[9px] text-gray-400">
              {AGENT_TYPES[template.type as keyof typeof AGENT_TYPES].label} • v{template.version}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <p className="text-[9px] text-gray-300 mb-2">{template.description}</p>
        <div className="flex flex-wrap gap-0.5 mb-2">
          {template.capabilities?.slice(0, 3).map((capability, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="bg-black border border-gray-800 text-gray-300 text-[8px] px-1 py-0 h-3"
            >
              {capability}
            </Badge>
          ))}
          {template.capabilities && template.capabilities.length > 3 && (
            <Badge
              variant="secondary"
              className="bg-black border border-gray-800 text-gray-300 text-[8px] px-1 py-0 h-3"
            >
              +{template.capabilities.length - 3}
            </Badge>
          )}
        </div>
        <div className="flex flex-wrap gap-0.5">
          {template.tags?.map((tag, index) => (
            <Badge key={index} variant="outline" className="border-gray-800 text-gray-400 text-[8px] px-1 py-0 h-3">
              #{tag}
            </Badge>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-3 pt-0">
        <Button
          onClick={() => onUse(template)}
          className="bg-white text-black hover:bg-gray-100 text-[9px] w-full h-6"
          size="sm"
          disabled={isCreating}
        >
          {isCreating ? (
            <>
              <span className="mr-1">Creating...</span>
              <Loader2 className="h-2.5 w-2.5 animate-spin" />
            </>
          ) : (
            <>
              <Plus className="h-2.5 w-2.5 mr-1" />
              Use Template
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

interface EditAgentFormProps {
  agent: Agent
  formData: Partial<Agent>
  onChange: (field: keyof Agent, value: any) => void
  onSave: () => void
  onCancel: () => void
}

function EditAgentForm({ agent, formData, onChange, onSave, onCancel }: EditAgentFormProps) {
  const [newCapability, setNewCapability] = useState("")
  const [newTag, setNewTag] = useState("")
  const [activeTab, setActiveTab] = useState("basic")

  const addCapability = () => {
    if (newCapability.trim() && !formData.capabilities?.includes(newCapability.trim())) {
      onChange("capabilities", [...(formData.capabilities || []), newCapability.trim()])
      setNewCapability("")
    }
  }

  const removeCapability = (capability: string) => {
    onChange("capabilities", formData.capabilities?.filter((c) => c !== capability) || [])
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      onChange("tags", [...(formData.tags || []), newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    onChange("tags", formData.tags?.filter((t) => t !== tag) || [])
  }

  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-center">
        <h2 className="text-xs font-medium text-white flex items-center gap-1">
          <Edit className="h-3 w-3 text-white" />
          <Save className="h-3 w-3 text-white" />
          Edit Agent
        </h2>
        <div className="flex gap-1.5">
          <Button variant="outline" onClick={onCancel} className="border-gray-800 text-white text-xs h-6" size="sm">
            Cancel
          </Button>
          <Button onClick={onSave} className="bg-white text-black hover:bg-gray-100 text-xs h-6" size="sm">
            <Save className="h-2.5 w-2.5 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-black border border-gray-800 mb-2.5 w-full h-7">
          <TabsTrigger value="basic" className="text-xs data-[state=active]:bg-gray-900 h-5">
            Basic Info
          </TabsTrigger>
          <TabsTrigger value="capabilities" className="text-xs data-[state=active]:bg-gray-900 h-5">
            Capabilities
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-xs data-[state=active]:bg-gray-900 h-5">
            Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="animate-in fade-in-50 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="edit-name" className="text-white text-xs">
                Agent Name
              </Label>
              <Input
                id="edit-name"
                value={formData.name || agent.name}
                onChange={(e) => onChange("name", e.target.value)}
                className="bg-black border-gray-800 text-white text-xs h-7"
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-version" className="text-white text-xs">
                Version
              </Label>
              <Input
                id="edit-version"
                value={formData.version || agent.version || "1.0.0"}
                onChange={(e) => onChange("version", e.target.value)}
                className="bg-black border-gray-800 text-white text-xs h-7"
              />
            </div>
          </div>

          <div className="space-y-1 mt-2.5">
            <Label htmlFor="edit-description" className="text-white text-xs">
              Description
            </Label>
            <Textarea
              id="edit-description"
              value={formData.description || agent.description}
              onChange={(e) => onChange("description", e.target.value)}
              className="bg-black border-gray-800 text-white text-xs min-h-[50px]"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 mt-2.5">
            <div className="space-y-1">
              <Label htmlFor="edit-type" className="text-white text-xs">
                Agent Type
              </Label>
              <Select
                value={formData.type || agent.type}
                onValueChange={(value) => onChange("type", value as Agent["type"])}
              >
                <SelectTrigger className="bg-black border-gray-800 text-white text-xs h-7">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-800">
                  {Object.entries(AGENT_TYPES).map(([value, { label, fullIcon }]) => (
                    <SelectItem key={value} value={value} className="text-white text-xs">
                      <div className="flex items-center gap-1">
                        {fullIcon}
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-status" className="text-white text-xs">
                Status
              </Label>
              <Select
                value={formData.status || agent.status}
                onValueChange={(value) => onChange("status", value as Agent["status"])}
              >
                <SelectTrigger className="bg-black border-gray-800 text-white text-xs h-7">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-800">
                  {Object.entries(AGENT_STATUSES).map(([value]) => (
                    <SelectItem key={value} value={value} className="text-white text-xs">
                      <div className="flex items-center gap-1">
                        {AGENT_STATUSES[value as keyof typeof AGENT_STATUSES].icon}
                        <span>{value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-priority" className="text-white text-xs">
                Priority
              </Label>
              <Select
                value={formData.priority || agent.priority || "Medium"}
                onValueChange={(value) => onChange("priority", value as Agent["priority"])}
              >
                <SelectTrigger className="bg-black border-gray-800 text-white text-xs h-7">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-800">
                  {Object.entries(AGENT_PRIORITIES).map(([value]) => (
                    <SelectItem key={value} value={value} className="text-white text-xs">
                      <div className="flex items-center gap-1">
                        {AGENT_PRIORITIES[value as keyof typeof AGENT_PRIORITIES].icon}
                        <span>{value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="animate-in fade-in-50 duration-200">
          <div className="space-y-2.5">
            <div className="space-y-1">
              <Label htmlFor="edit-capabilities" className="text-white text-xs">
                Capabilities
              </Label>
              <div className="flex mt-1 mb-1">
                <Input
                  id="edit-capabilities"
                  value={newCapability}
                  onChange={(e) => setNewCapability(e.target.value)}
                  placeholder="Add capability"
                  className="rounded-r-none bg-black border-gray-800 text-white text-xs h-7"
                />
                <Button
                  type="button"
                  onClick={addCapability}
                  className="rounded-l-none bg-white text-black text-xs h-7"
                  size="sm"
                >
                  Add
                </Button>
              </div>

              {formData.capabilities && formData.capabilities.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.capabilities.map((capability, index) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1 bg-black border border-gray-800 text-white text-[9px] px-1 py-0 h-4"
                    >
                      {capability}
                      <X
                        className="w-2 h-2 cursor-pointer hover:text-rose-400"
                        onClick={() => removeCapability(capability)}
                      />
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-gray-400 mt-1">
                  No capabilities added. Select from common capabilities or add your own.
                </p>
              )}

              <div className="flex flex-wrap gap-1 mt-1">
                {SAMPLE_CAPABILITIES.slice(0, 4).map((capability, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="cursor-pointer border-gray-800 text-gray-300 hover:border-white text-[9px] px-1 py-0 h-4"
                    onClick={() => {
                      if (!formData.capabilities?.includes(capability)) {
                        onChange("capabilities", [...(formData.capabilities || []), capability])
                      }
                    }}
                  >
                    + {capability}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="edit-tags" className="text-white text-xs">
                Tags
              </Label>
              <div className="flex mt-1 mb-1">
                <Input
                  id="edit-tags"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag"
                  className="rounded-r-none bg-black border-gray-800 text-white text-xs h-7"
                />
                <Button
                  type="button"
                  onClick={addTag}
                  className="rounded-l-none bg-white text-black text-xs h-7"
                  size="sm"
                >
                  Add
                </Button>
              </div>

              {formData.tags && formData.tags.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-1">
                  {formData.tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1 border-gray-800 text-white text-[9px] px-1 py-0 h-4"
                    >
                      #{tag}
                      <X className="w-2 h-2 cursor-pointer hover:text-rose-400" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-[9px] text-gray-400 mt-1">
                  No tags added. Tags help categorize and find your agents.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="animate-in fade-in-50 duration-200">
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <Switch
                id="favorite"
                checked={formData.favorited !== undefined ? formData.favorited : agent.favorited || false}
                onCheckedChange={(checked) => onChange("favorited", checked)}
                className="scale-75"
              />
              <Label htmlFor="favorite" className="text-white text-xs">
                Mark as favorite
              </Label>
            </div>

            <div className="bg-black border border-gray-800 rounded-sm p-2.5">
              <h3 className="text-white font-medium text-xs mb-1.5 flex items-center gap-1">
                <Shield className="h-3 w-3 text-white" />
                Agent Security
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Switch id="edit-secure-mode" className="scale-75" />
                    <Label htmlFor="edit-secure-mode" className="text-white text-xs">
                      Enable Secure Mode
                    </Label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Switch id="edit-rate-limiting" className="scale-75" />
                    <Label htmlFor="edit-rate-limiting" className="text-white text-xs">
                      Enable Rate Limiting
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-black border border-gray-800 rounded-sm p-2.5">
              <h3 className="text-white font-medium text-xs mb-1.5 flex items-center gap-1">
                <Sliders className="h-3 w-3 text-white" />
                Performance Settings
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Switch id="edit-high-performance" className="scale-75" />
                    <Label htmlFor="edit-high-performance" className="text-white text-xs">
                      High Performance Mode
                    </Label>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Switch id="edit-auto-scaling" className="scale-75" />
                    <Label htmlFor="edit-auto-scaling" className="text-white text-xs">
                      Enable Auto-scaling
                    </Label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface AgentDetailsProps {
  agent: Agent
  onEdit: () => void
  onDelete: () => void
  onDuplicate: () => void
  onFavorite: () => void
  onUse: () => void
  onClose: () => void
  onOpenWorkflow: (agentName: string) => void
  onOpenAnalytics?: (agentName: string) => void
  onOpenSettings?: (section?: string) => void
  onOpenApiDocs?: (section?: string) => void
  formatTimeAgo: (date: Date) => string
  getPerformanceColor: (performance: number) => string
}

function AgentDetails({
  agent,
  onEdit,
  onDelete,
  onDuplicate,
  onFavorite,
  onUse,
  onClose,
  onOpenWorkflow,
  onOpenAnalytics,
  onOpenSettings,
  onOpenApiDocs,
  formatTimeAgo,
  getPerformanceColor,
}: AgentDetailsProps) {
  return (
    <div>
      <div className="flex justify-between items-start mb-2.5">
        <div className="flex items-center gap-2.5">
          <Avatar className="h-8 w-8 border border-gray-800">
            <AvatarImage src={agent.avatarUrl || "/placeholder.svg"} alt={agent.name} />
            <AvatarFallback className="bg-gray-900 text-white text-[9px]">
              {agent.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-1">
              <h2 className="text-xs font-medium text-white">{agent.name}</h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 rounded-full hover:bg-gray-900"
                    onClick={onFavorite}
                  >
                    <Star
                      className={`h-2.5 w-2.5 ${agent.favorited ? "text-amber-400 fill-amber-400" : "text-gray-500"}`}
                    />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[10px]">
                  <p>{agent.favorited ? "Remove from favorites" : "Add to favorites"}</p>
                </TooltipContent>
              </Tooltip>
              {agent.version && (
                <Badge variant="outline" className="border-gray-800 text-gray-400 text-[9px] px-1 py-0 h-3.5">
                  v{agent.version}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Badge
                className={`${AGENT_STATUSES[agent.status].bgColor} px-1 py-0 h-3.5 text-[9px] flex items-center gap-0.5`}
              >
                {AGENT_STATUSES[agent.status].icon}
                <span className={`${AGENT_STATUSES[agent.status].color}`}>{agent.status}</span>
              </Badge>
              <span className="text-gray-500 text-[9px]">•</span>
              <span className={`${AGENT_TYPES[agent.type].color} text-[9px] flex items-center gap-0.5`}>
                {AGENT_TYPES[agent.type].icon}
                {AGENT_TYPES[agent.type].label}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" onClick={onClose} className="h-5 w-5 rounded-full hover:bg-gray-900">
                <X className="h-2.5 w-2.5 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px]">
              <p>Close details</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>

      <p className="text-[9px] text-gray-300 mb-3">{agent.description}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <div className="space-y-1.5">
          <h3 className="text-[9px] font-medium text-white">Details</h3>
          <div className="space-y-1 text-[9px]">
            <div className="flex justify-between">
              <span className="text-gray-400">Created</span>
              <span className="text-white">{agent.createdAt.toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Last Active</span>
              <span className="text-white">{agent.lastActive ? formatTimeAgo(agent.lastActive) : "Never"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Type</span>
              <span className={AGENT_TYPES[agent.type].color}>{AGENT_TYPES[agent.type].label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className={AGENT_STATUSES[agent.status].color}>{agent.status}</span>
            </div>
            {agent.priority && (
              <div className="flex justify-between">
                <span className="text-gray-400">Priority</span>
                <span className={AGENT_PRIORITIES[agent.priority].color}>{agent.priority}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-400">Usage Count</span>
              <span className="text-white">{agent.usageCount || 0}</span>
            </div>
            {agent.performance !== undefined && (
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Performance</span>
                <div className="flex items-center gap-1">
                  <span className="text-white">{agent.performance}%</span>
                  <div className="w-10 h-1 bg-gray-900 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${agent.performance}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      className={`h-full ${getPerformanceColor(agent.performance)}`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[9px] font-medium text-white">Actions</h3>
          <div className="flex flex-wrap gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button className="bg-white text-black hover:bg-gray-100 text-[9px] h-6" onClick={onEdit} size="sm">
                  <Edit className="h-2.5 w-2.5 mr-1" />
                  Edit
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]">
                <p>Edit agent details</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-800 text-white hover:bg-gray-900 text-[9px] h-6"
                  onClick={onUse}
                  size="sm"
                >
                  <Zap className="h-2.5 w-2.5 mr-1 text-amber-400" />
                  Run
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]">
                <p>Run this agent</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-800 text-white hover:bg-gray-900 text-[9px] h-6"
                  onClick={onDuplicate}
                  size="sm"
                >
                  <Copy className="h-2.5 w-2.5 mr-1 text-sky-400" />
                  Duplicate
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]">
                <p>Create a copy of this agent</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="border-gray-800 text-rose-400 hover:bg-gray-900 text-[9px] h-6"
                  onClick={onDelete}
                  size="sm"
                >
                  <Trash className="h-2.5 w-2.5 mr-1" />
                  Delete
                </Button>
              </TooltipTrigger>
              <TooltipContent className="text-[10px]">
                <p>Permanently delete this agent</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-800">
            <div className="flex items-center justify-between mb-1">
              <h4 className="text-[9px] font-medium text-white">Quick Actions</h4>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-gray-900">
                    <MoreHorizontal className="h-2.5 w-2.5 text-gray-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="bg-black border-gray-800 p-1.5 w-36">
                  <div className="space-y-0.5">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[9px] h-6 px-1.5"
                      size="sm"
                      onClick={() => onOpenAnalytics?.(agent.name)}
                    >
                      <BarChart className="h-2.5 w-2.5 mr-1 text-violet-400" />
                      View Analytics
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[9px] h-6 px-1.5"
                      size="sm"
                      onClick={() => onOpenSettings?.("agent")}
                    >
                      <Settings className="h-2.5 w-2.5 mr-1 text-sky-400" />
                      Configure
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[9px] h-6 px-1.5"
                      size="sm"
                      onClick={() => onOpenWorkflow(agent.name)}
                    >
                      <Workflow className="h-2.5 w-2.5 mr-1 text-emerald-400" />
                      Workflows
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-[9px] h-6 px-1.5"
                      size="sm"
                      onClick={() => onOpenApiDocs?.("agent")}
                    >
                      <Shield className="h-2.5 w-2.5 mr-1 text-rose-400" />
                      Permissions
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-2 gap-1">
              <Button
                variant="outline"
                className="border-gray-800 text-white hover:bg-gray-900 text-[8px] h-5 justify-start"
                size="sm"
                onClick={() => onOpenAnalytics?.(agent.name)}
              >
                <BarChart className="h-2.5 w-2.5 mr-1 text-violet-400" />
                Analytics
              </Button>
              <Button
                variant="outline"
                className="border-gray-800 text-white hover:bg-gray-900 text-[8px] h-5 justify-start"
                size="sm"
                onClick={() => onOpenSettings?.("agent")}
              >
                <Settings className="h-2.5 w-2.5 mr-1 text-sky-400" />
                Settings
              </Button>
              <Button
                variant="outline"
                className="border-gray-800 text-white hover:bg-gray-900 text-[8px] h-5 justify-start"
                size="sm"
                onClick={() => onOpenWorkflow(agent.name)}
              >
                <Workflow className="h-2.5 w-2.5 mr-1 text-emerald-400" />
                Workflows
              </Button>
              <Button
                variant="outline"
                className="border-gray-800 text-white hover:bg-gray-900 text-[8px] h-5 justify-start"
                size="sm"
                onClick={() => onOpenApiDocs?.("agent")}
              >
                <Power className="h-2.5 w-2.5 mr-1 text-rose-400" />
                API
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <h3 className="text-[9px] font-medium text-white">Capabilities</h3>
          {agent.capabilities && agent.capabilities.length > 0 ? (
            <div className="flex flex-wrap gap-0.5">
              {agent.capabilities.map((capability, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-black border border-gray-800 text-white text-[8px] px-1 py-0 h-4"
                >
                  {capability}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-[9px]">No capabilities defined</p>
          )}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-[9px] font-medium text-white">Tags</h3>
          {agent.tags && agent.tags.length > 0 ? (
            <div className="flex flex-wrap gap-0.5">
              {agent.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="border-gray-800 text-white text-[8px] px-1 py-0 h-4">
                  #{tag}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-[9px]">No tags defined</p>
          )}
        </div>
      </div>
    </div>
  )
}

interface CreateAgentFormProps {
  onSubmit: (agent: Omit<Agent, "id" | "createdAt" | "avatarUrl">) => void
  updatePreviewAvatar: (name: string) => void
  previewAvatar: string | null
  formStep: number
  nextStep: () => void
  prevStep: () => void
  isCreating: boolean
}

function CreateAgentForm({
  onSubmit,
  updatePreviewAvatar,
  previewAvatar,
  formStep,
  nextStep,
  prevStep,
  isCreating,
}: CreateAgentFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Active" as Agent["status"],
    type: "Assistant" as Agent["type"],
    capabilities: [] as string[],
    tags: [] as string[],
    priority: "Medium" as Agent["priority"],
    version: "1.0.0",
  })
  const [error, setError] = useState<string | null>(null)
  const [newCapability, setNewCapability] = useState("")
  const [newTag, setNewTag] = useState("")
  const [formErrors, setFormErrors] = useState({
    name: false,
    description: false,
  })

  const handleChange = (field: keyof typeof formData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "name") {
      updatePreviewAvatar(value)
      setFormErrors((prev) => ({ ...prev, name: value.trim() === "" }))
    }
    if (field === "description") {
      setFormErrors((prev) => ({ ...prev, description: value.trim() === "" }))
    }
  }

  const addCapability = () => {
    if (newCapability.trim() && !formData.capabilities.includes(newCapability.trim())) {
      handleChange("capabilities", [...formData.capabilities, newCapability.trim()])
      setNewCapability("")
    }
  }

  const removeCapability = (capability: string) => {
    handleChange(
      "capabilities",
      formData.capabilities.filter((c) => c !== capability),
    )
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      handleChange("tags", [...formData.tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tag: string) => {
    handleChange(
      "tags",
      formData.tags.filter((t) => t !== tag),
    )
  }

  const validateStep = () => {
    if (formStep === 1) {
      if (!formData.name.trim()) {
        setFormErrors((prev) => ({ ...prev, name: true }))
        setError("Agent name is required")
        return false
      }
      if (!formData.description.trim()) {
        setFormErrors((prev) => ({ ...prev, description: true }))
        setError("Agent description is required")
        return false
      }
    }
    setError(null)
    return true
  }

  const handleNextStep = () => {
    if (validateStep()) {
      nextStep()
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.name.trim()) {
      setFormErrors((prev) => ({ ...prev, name: true }))
      setError("Agent name is required")
      return
    }

    if (!formData.description.trim()) {
      setFormErrors((prev) => ({ ...prev, description: true }))
      setError("Agent description is required")
      return
    }

    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      {error && (
        <div className="bg-rose-500/10 border border-rose-800 rounded-sm p-1.5 text-rose-300 text-xs flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </div>
      )}

      {/* Step 1: Basic Info */}
      {formStep === 1 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-center mb-2.5">
            {previewAvatar ? (
              <Avatar className="h-14 w-14 border border-gray-800">
                <AvatarImage src={previewAvatar || "/placeholder.svg"} alt="Agent Preview" />
                <AvatarFallback className="bg-gray-900 text-white text-xs">
                  {formData.name.substring(0, 2).toUpperCase() || "AI"}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="h-14 w-14 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center">
                <Bot className="h-7 w-7 text-gray-700" />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label htmlFor="name" className="text-white text-xs">
                  Agent Name <span className="text-rose-400">*</span>
                </Label>
                {formErrors.name && <span className="text-rose-400 text-[9px]">Required</span>}
              </div>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Enter agent name"
                className={`bg-black border-gray-800 text-white text-xs h-7 ${
                  formErrors.name ? "border-rose-500" : ""
                }`}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="version" className="text-white text-xs">
                Version
              </Label>
              <Input
                id="version"
                value={formData.version}
                onChange={(e) => handleChange("version", e.target.value)}
                placeholder="1.0.0"
                className="bg-black border-gray-800 text-white text-xs h-7"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-white text-xs">
                Description <span className="text-rose-400">*</span>
              </Label>
              {formErrors.description && <span className="text-rose-400 text-[9px]">Required</span>}
            </div>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe what this agent does"
              className={`bg-black border-gray-800 text-white text-xs min-h-[50px] ${
                formErrors.description ? "border-rose-500" : ""
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            <div className="space-y-1">
              <Label htmlFor="type" className="text-white text-xs">
                Agent Type
              </Label>
              <Select value={formData.type} onValueChange={(value) => handleChange("type", value as Agent["type"])}>
                <SelectTrigger className="bg-black border-gray-800 text-white text-xs h-7">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-800">
                  {Object.entries(AGENT_TYPES).map(([value, { label, fullIcon }]) => (
                    <SelectItem key={value} value={value} className="text-white text-xs">
                      <div className="flex items-center gap-1.5">
                        {fullIcon}
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="status" className="text-white text-xs">
                Status
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value as Agent["status"])}
              >
                <SelectTrigger className="bg-black border-gray-800 text-white text-xs h-7">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-800">
                  {Object.entries(AGENT_STATUSES).map(([value]) => (
                    <SelectItem key={value} value={value} className="text-white text-xs">
                      <div className="flex items-center gap-1.5">
                        {AGENT_STATUSES[value as keyof typeof AGENT_STATUSES].icon}
                        <span>{value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label htmlFor="priority" className="text-white text-xs">
                Priority
              </Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => handleChange("priority", value as Agent["priority"])}
              >
                <SelectTrigger className="bg-black border-gray-800 text-white text-xs h-7">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent className="bg-black border-gray-800">
                  {Object.entries(AGENT_PRIORITIES).map(([value]) => (
                    <SelectItem key={value} value={value} className="text-white text-xs">
                      <div className="flex items-center gap-1.5">
                        {AGENT_PRIORITIES[value as keyof typeof AGENT_PRIORITIES].icon}
                        <span>{value}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Capabilities */}
      {formStep === 2 && (
        <div className="space-y-2.5">
          <div className="space-y-1">
            <Label htmlFor="capabilities" className="text-white text-xs">
              Capabilities
            </Label>
            <div className="flex mt-1 mb-1">
              <Input
                id="capabilities"
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                placeholder="Add capability"
                className="rounded-r-none bg-black border-gray-800 text-white text-xs h-7"
              />
              <Button
                type="button"
                onClick={addCapability}
                className="rounded-l-none bg-white text-black text-xs h-7"
                size="sm"
              >
                Add
              </Button>
            </div>

            {formData.capabilities.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.capabilities.map((capability, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center gap-1 bg-black border border-gray-800 text-white text-[9px] px-1 py-0 h-4"
                  >
                    {capability}
                    <X
                      className="w-2 h-2 cursor-pointer hover:text-rose-400"
                      onClick={() => removeCapability(capability)}
                    />
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-gray-400 mt-1">
                No capabilities added. Select from common capabilities or add your own.
              </p>
            )}

            <div className="flex flex-wrap gap-1 mt-1">
              {SAMPLE_CAPABILITIES.slice(0, 4).map((capability, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="cursor-pointer border-gray-800 text-gray-300 hover:border-white text-[9px] px-1 py-0 h-4"
                  onClick={() => {
                    if (!formData.capabilities.includes(capability)) {
                      handleChange("capabilities", [...formData.capabilities, capability])
                    }
                  }}
                >
                  + {capability}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="tags" className="text-white text-xs">
              Tags
            </Label>
            <div className="flex mt-1 mb-1">
              <Input
                id="tags"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                className="rounded-r-none bg-black border-gray-800 text-white text-xs h-7"
              />
              <Button
                type="button"
                onClick={addTag}
                className="rounded-l-none bg-white text-black text-xs h-7"
                size="sm"
              >
                Add
              </Button>
            </div>

            {formData.tags.length > 0 ? (
              <div className="flex flex-wrap gap-1 mt-1">
                {formData.tags.map((tag, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="flex items-center gap-1 border-gray-800 text-white text-[9px] px-1 py-0 h-4"
                  >
                    #{tag}
                    <X className="w-2 h-2 cursor-pointer hover:text-rose-400" onClick={() => removeTag(tag)} />
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-[9px] text-gray-400 mt-1">No tags added. Tags help categorize and find your agents.</p>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Advanced Settings */}
      {formStep === 3 && (
        <div className="space-y-2.5">
          <div className="bg-black border border-gray-800 rounded-sm p-2.5">
            <h3 className="text-white font-medium text-xs mb-1.5 flex items-center gap-1">
              <Shield className="h-3 w-3 text-white" />
              Agent Security
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Switch id="secure-mode" className="scale-75" />
                  <Label htmlFor="secure-mode" className="text-white text-xs">
                    Enable Secure Mode
                  </Label>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                      <HelpCircle className="h-2.5 w-2.5 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[9px]">
                    <p>Restricts agent access to sensitive data</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Switch id="rate-limiting" className="scale-75" />
                  <Label htmlFor="rate-limiting" className="text-white text-xs">
                    Enable Rate Limiting
                  </Label>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                      <HelpCircle className="h-2.5 w-2.5 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[9px]">
                    <p>Prevents excessive usage of the agent</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="bg-black border border-gray-800 rounded-sm p-2.5">
            <h3 className="text-white font-medium text-xs mb-1.5 flex items-center gap-1">
              <Sliders className="h-3 w-3 text-white" />
              Performance Settings
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Switch id="high-performance" className="scale-75" />
                  <Label htmlFor="high-performance" className="text-white text-xs">
                    High Performance Mode
                  </Label>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                      <HelpCircle className="h-2.5 w-2.5 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[9px]">
                    <p>Allocates more resources to this agent</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Switch id="auto-scaling" className="scale-75" />
                  <Label htmlFor="auto-scaling" className="text-white text-xs">
                    Enable Auto-scaling
                  </Label>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                      <HelpCircle className="h-2.5 w-2.5 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[9px]">
                    <p>Automatically adjusts resources based on demand</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          <div className="bg-black border border-gray-800 rounded-sm p-2.5">
            <h3 className="text-white font-medium text-xs mb-1.5 flex items-center gap-1">
              <Workflow className="h-3 w-3 text-white" />
              Integration Settings
            </h3>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Switch id="api-access" className="scale-75" />
                  <Label htmlFor="api-access" className="text-white text-xs">
                    Enable API Access
                  </Label>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                      <HelpCircle className="h-2.5 w-2.5 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[9px]">
                    <p>Allows this agent to be accessed via API</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Switch id="webhook-notifications" className="scale-75" />
                  <Label htmlFor="webhook-notifications" className="text-white text-xs">
                    Webhook Notifications
                  </Label>
                </div>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-4 w-4 rounded-full">
                      <HelpCircle className="h-2.5 w-2.5 text-gray-500" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="text-[9px]">
                    <p>Sends notifications when agent completes tasks</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Form Navigation */}
      <div className="flex justify-between pt-2">
        {formStep > 1 ? (
          <Button type="button" variant="outline" onClick={prevStep} className="text-xs h-7 border-gray-800" size="sm">
            <ChevronLeft className="h-3 w-3 mr-1" />
            Back
          </Button>
        ) : (
          <div></div>
        )}

        {formStep < 3 ? (
          <Button
            type="button"
            onClick={handleNextStep}
            className="bg-white text-black hover:bg-gray-100 text-xs h-7"
            size="sm"
          >
            Next
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        ) : (
          <Button
            type="submit"
            className="bg-white text-black hover:bg-gray-100 text-xs h-7"
            size="sm"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Sparkles className="h-3 w-3 mr-1.5" />
                Create Agent
              </>
            )}
          </Button>
        )}
      </div>
    </form>
  )
}

export default function AIAgentsDivider() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [onboardingStep, setOnboardingStep] = useState(1)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [editFormData, setEditFormData] = useState<Partial<Agent>>({})
  const [activeTab, setActiveTab] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterType, setFilterType] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [showFilters, setShowFilters] = useState(false)
  const [formStep, setFormStep] = useState(1)
  const [formProgress, setFormProgress] = useState(33)
  const [isCreating, setIsCreating] = useState(false)
  const [isWorkflowDialogOpen, setIsWorkflowDialogOpen] = useState(false)
  const [selectedWorkflow, setSelectedWorkflow] = useState<string | null>(null)
  const [isCommandOpen, setIsCommandOpen] = useState(false)
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [isApiDocsOpen, setIsApiDocsOpen] = useState(false)
  const [isKeyboardShortcutsOpen, setIsKeyboardShortcutsOpen] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

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
          })),
        )
      }

      // Check if onboarding has been shown before
      const onboardingShown = localStorage.getItem("onboardingShown")
      if (!onboardingShown) {
        setShowOnboarding(true)
      }
    } catch (err) {
      console.error("Error loading agents from localStorage:", err)
    }
  }, [])

  // Save agents to localStorage when updated
  useEffect(() => {
    try {
      localStorage.setItem("agents", JSON.stringify(agents))
    } catch (err) {
      console.error("Error saving agents to localStorage:", err)
    }
  }, [agents])

  // Show filters when agents exist
  useEffect(() => {
    if (agents.length > 0) {
      setShowFilters(true)
    } else {
      setShowFilters(false)
    }
  }, [agents])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command palette
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        setIsCommandOpen((prev) => !prev)
      }

      // Create new agent
      if ((e.ctrlKey || e.metaKey) && e.key === "n") {
        e.preventDefault()
        setIsCreateDialogOpen(true)
      }

      // Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === "f" && agents.length > 0) {
        e.preventDefault()
        const searchInput = document.getElementById("agent-search")
        if (searchInput) {
          searchInput.focus()
        }
      }

      // Edit selected agent
      if ((e.ctrlKey || e.metaKey) && e.key === "e" && selectedAgent) {
        e.preventDefault()
        handleEditAgent()
      }

      // Save changes
      if ((e.ctrlKey || e.metaKey) && e.key === "s" && isEditMode) {
        e.preventDefault()
        handleSaveEdit()
      }

      // Delete selected agent
      if ((e.ctrlKey || e.metaKey) && e.key === "d" && selectedAgent) {
        e.preventDefault()
        handleDeleteAgent(selectedAgent.id)
      }

      // Switch tabs with Alt+1-5
      if (e.altKey && ["1", "2", "3", "4", "5"].includes(e.key) && agents.length > 0) {
        e.preventDefault()
        const tabIndex = Number.parseInt(e.key) - 1
        const tabs = ["all", "active", "maintenance", "offline", "favorites"]
        if (tabs[tabIndex]) {
          setActiveTab(tabs[tabIndex])
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [agents, selectedAgent, isEditMode])

  const generateAvatar = useCallback((agentName: string) => {
    return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(agentName)}`
  }, [])

  const handleCreateAgent = (agent: Omit<Agent, "id" | "createdAt" | "avatarUrl">) => {
    setIsCreating(true)

    // Simulate a delay for the creation process
    setTimeout(() => {
      const now = new Date()
      const newAgent: Agent = {
        ...agent,
        id: Date.now(),
        createdAt: now,
        lastActive: now,
        avatarUrl: generateAvatar(agent.name),
        usageCount: 0,
        performance: Math.floor(Math.random() * 100),
        favorited: false,
      }

      setAgents((prev) => [...prev, newAgent])
      setIsCreateDialogOpen(false)
      setIsCreating(false)
      setFormStep(1)
      setFormProgress(33)

      toast.success("Agent created", {
        description: `${newAgent.name} has been successfully created.`,
        className: "bg-black border border-gray-800 text-white",
      })
    }, 800)
  }

  const handleDeleteAgent = (agentId: number) => {
    const agentToDelete = agents.find((agent) => agent.id === agentId)
    if (!agentToDelete) return

    setAgents((prev) => prev.filter((agent) => agent.id !== agentId))

    if (selectedAgent?.id === agentId) {
      setSelectedAgent(null)
    }

    toast.success("Agent deleted", {
      description: `${agentToDelete.name} has been successfully deleted.`,
      className: "bg-black border border-gray-800 text-white",
    })
  }

  const handleDuplicateAgent = (agent: Agent) => {
    const now = new Date()
    const newAgent: Agent = {
      ...agent,
      id: Date.now(),
      name: `${agent.name} (Copy)`,
      createdAt: now,
      lastActive: now,
      usageCount: 0,
    }

    setAgents((prev) => [...prev, newAgent])
    toast.success("Agent duplicated", {
      description: `${agent.name} has been duplicated as ${newAgent.name}`,
      className: "bg-black border border-gray-800 text-white",
    })
  }

  const handleToggleFavorite = (agentId: number) => {
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === agentId) {
          return {
            ...agent,
            favorited: !agent.favorited,
          }
        }
        return agent
      }),
    )

    // If the selected agent is the one being favorited, update it
    if (selectedAgent?.id === agentId) {
      setSelectedAgent((prev) => {
        if (!prev) return null
        return {
          ...prev,
          favorited: !prev.favorited,
        }
      })
    }
  }

  const handleIncrementUsage = (agentId: number) => {
    const now = new Date()
    setAgents((prev) =>
      prev.map((agent) => {
        if (agent.id === agentId) {
          return {
            ...agent,
            usageCount: (agent.usageCount || 0) + 1,
            lastActive: now,
          }
        }
        return agent
      }),
    )

    // If the selected agent is the one being used, update it
    if (selectedAgent?.id === agentId) {
      setSelectedAgent((prev) => {
        if (!prev) return null
        return {
          ...prev,
          usageCount: (prev.usageCount || 0) + 1,
          lastActive: now,
        }
      })
    }

    toast.success("Agent activated", {
      description: "Usage count incremented and timestamp updated",
      className: "bg-black border border-gray-800 text-white",
    })
  }

  const dismissOnboarding = () => {
    setShowOnboarding(false)
    localStorage.setItem("onboardingShown", "true")
  }

  const nextOnboardingStep = () => {
    if (onboardingStep < 3) {
      setOnboardingStep(onboardingStep + 1)
    } else {
      dismissOnboarding()
    }
  }

  const prevOnboardingStep = () => {
    if (onboardingStep > 1) {
      setOnboardingStep(onboardingStep - 1)
    }
  }

  const handleAgentClick = (agent: Agent) => {
    setSelectedAgent(agent)
    setIsEditMode(false)
    setEditFormData({})
  }

  const updatePreviewAvatar = useCallback(
    (name: string) => {
      if (name.trim().length > 0) {
        setPreviewAvatar(generateAvatar(name))
      } else {
        setPreviewAvatar(null)
      }
    },
    [generateAvatar],
  )

  const handleEditAgent = () => {
    if (!selectedAgent) return
    setEditFormData({ ...selectedAgent })
    setIsEditMode(true)
  }

  const handleSaveEdit = () => {
    if (!selectedAgent || !editFormData) return

    const updatedAgent = {
      ...selectedAgent,
      ...editFormData,
    }

    setAgents((prev) => prev.map((agent) => (agent.id === selectedAgent.id ? updatedAgent : agent)))

    setSelectedAgent(updatedAgent)
    setIsEditMode(false)
    setEditFormData({})

    toast.success("Agent updated", {
      description: `${updatedAgent.name} has been successfully updated.`,
      className: "bg-black border border-gray-800 text-white",
    })
  }

  const handleCancelEdit = () => {
    setIsEditMode(false)
    setEditFormData({})
  }

  const handleEditFormChange = (field: keyof Agent, value: any) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleUseTemplate = (template: (typeof AGENT_TEMPLATES)[0]) => {
    setIsCreating(true)

    // Simulate a delay for the creation process
    setTimeout(() => {
      const templateData = {
        name: template.name,
        description: template.description,
        status: template.status as Agent["status"],
        type: template.type as Agent["type"],
        capabilities: template.capabilities,
        tags: template.tags,
        priority: template.priority as Agent["priority"],
        version: template.version,
      }

      handleCreateAgent(templateData)
    }, 600)
  }

  const handleOpenWorkflow = (agentName: string) => {
    setSelectedWorkflow(agentName)
    setIsWorkflowDialogOpen(true)
  }

  const handleOpenAnalytics = (agentName?: string) => {
    setActiveSection(agentName || "all")
    setIsAnalyticsOpen(true)
  }

  const handleOpenSettings = (section?: string) => {
    setActiveSection(section || "general")
    setIsSettingsOpen(true)
  }

  const handleOpenApiDocs = (section?: string) => {
    setActiveSection(section || "overview")
    setIsApiDocsOpen(true)
  }

  const nextFormStep = () => {
    if (formStep < 3) {
      setFormStep(formStep + 1)
      setFormProgress(formStep === 1 ? 66 : formStep === 2 ? 100 : 100)
    }
  }

  const prevFormStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1)
      setFormProgress(formStep === 3 ? 66 : formStep === 2 ? 33 : 33)
    }
  }

  // Filter and sort agents
  const filteredAgents = useMemo(() => {
    return [...agents]
      .filter((agent) => {
        const matchesSearch =
          agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          agent.capabilities?.some((cap) => cap.toLowerCase().includes(searchTerm.toLowerCase())) ||
          agent.tags?.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

        const matchesStatus = filterStatus === "all" || agent.status === filterStatus
        const matchesType = filterType === "all" || agent.type === filterType

        const matchesTab =
          activeTab === "all" ||
          (activeTab === "active" && agent.status === "Active") ||
          (activeTab === "maintenance" && agent.status === "Maintenance") ||
          (activeTab === "offline" && agent.status === "Offline") ||
          (activeTab === "favorites" && agent.favorited)

        return matchesSearch && matchesStatus && matchesType && matchesTab
      })
      .sort((a, b) => {
        // Sort by creation date
        const dateA = a.createdAt.getTime()
        const dateB = b.createdAt.getTime()
        return sortOrder === "asc" ? dateA - dateB : dateB - dateA
      })
  }, [agents, searchTerm, filterStatus, filterType, activeTab, sortOrder])

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}d ago`

    return date.toLocaleDateString()
  }

  const getPerformanceColor = (performance: number) => {
    if (performance >= 80) return "bg-emerald-400"
    if (performance >= 50) return "bg-amber-400"
    return "bg-rose-400"
  }

  return (
    <TooltipProvider>
      <div className="w-full bg-black text-white min-h-screen">
        {/* Onboarding Dialog */}
        <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
          <DialogContent className="bg-black border border-gray-800 text-white max-w-md p-5">
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-lg font-medium flex items-center gap-2">
                <Command className="h-4 w-4 text-white" />
                AI Agent Manager
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-xs">
                {onboardingStep === 1
                  ? "Welcome to AI Agent Manager. Let's get you started."
                  : onboardingStep === 2
                    ? "Discover powerful keyboard shortcuts to boost your productivity."
                    : "Create your first AI agent to automate tasks and enhance your workflow."}
              </DialogDescription>
            </DialogHeader>

            <div className="py-2">
              {onboardingStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center mb-3">
                  
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        <Plus className="h-3.5 w-3.5 text-sky-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-xs text-white">Create Agents</h3>
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          Add new AI agents to automate tasks and workflows.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        <Bot className="h-3.5 w-3.5 text-violet-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-xs text-white">Manage Agents</h3>
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          View, edit, and configure your AI agents with ease.
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <div className="mt-0.5">
                        <Play className="h-3.5 w-3.5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-xs text-white">Run Agents</h3>
                        <p className="text-gray-400 text-[10px] mt-0.5">
                          Execute agents to perform automated tasks instantly.
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center mb-3">
                    <Keyboard className="h-16 w-16 text-gray-600" />
                  </div>
                  <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                    {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-[10px] text-gray-400">{shortcut.description}</span>
                        <div className="flex items-center gap-1">
                          {shortcut.modifier && (
                            <kbd className="bg-gray-900 text-[9px] px-1.5 py-0.5 rounded border border-gray-800">
                              {shortcut.modifier}
                            </kbd>
                          )}
                          <span className="text-[10px] text-gray-400">+</span>
                          <kbd className="bg-gray-900 text-[9px] px-1.5 py-0.5 rounded border border-gray-800">
                            {shortcut.key}
                          </kbd>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="pt-1 flex items-center justify-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-[10px] h-6 border-gray-800"
                      onClick={() => setIsKeyboardShortcutsOpen(true)}
                    >
                      <Keyboard className="h-3 w-3 mr-1" />
                      View All Shortcuts
                    </Button>
                  </div>
                </motion.div>
              )}

              {onboardingStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-center mb-3">
               
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="font-medium text-sm text-white">Ready to create your first agent?</h3>
                    <p className="text-gray-400 text-[10px]">
                      Start by creating a custom agent or choose from our templates to get up and running quickly.
                    </p>
                    <div className="pt-1">
                      <Button
                        className="bg-white text-black hover:bg-gray-100 text-xs font-medium"
                        onClick={() => {
                          dismissOnboarding()
                          setIsCreateDialogOpen(true)
                        }}
                        size="sm"
                      >
                        <Plus className="h-3 w-3 mr-1.5" />
                        Create Your First Agent
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            <DialogFooter className="flex items-center justify-between pt-1.5">
              {onboardingStep > 1 ? (
                <Button
                  variant="outline"
                  onClick={prevOnboardingStep}
                  className="text-xs h-6 border-gray-800"
                  size="sm"
                >
                  <ChevronLeft className="h-3 w-3 mr-1" />
                  Back
                </Button>
              ) : (
                <div></div>
              )}

              {onboardingStep < 3 ? (
                <Button
                  onClick={nextOnboardingStep}
                  className="bg-white text-black hover:bg-gray-100 text-xs h-6"
                  size="sm"
                >
                  Next
                  <ChevronRight className="h-3 w-3 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={dismissOnboarding}
                  className="bg-white text-black hover:bg-gray-100 text-xs h-6"
                  size="sm"
                >
                  Get Started
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Command Palette */}
        <CommandDialog open={isCommandOpen} onOpenChange={setIsCommandOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Agents">
              <CommandItem
                onSelect={() => {
                  setIsCommandOpen(false)
                  setIsCreateDialogOpen(true)
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                <span>Create New Agent</span>
              </CommandItem>
              {agents.length > 0 && (
                <>
                  <CommandItem
                    onSelect={() => {
                      setIsCommandOpen(false)
                      setActiveTab("all")
                    }}
                  >
                    <Layers className="mr-2 h-4 w-4" />
                    <span>View All Agents</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setIsCommandOpen(false)
                      setActiveTab("active")
                    }}
                  >
                    <CheckCircle className="mr-2 h-4 w-4 text-emerald-400" />
                    <span>View Active Agents</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setIsCommandOpen(false)
                      setActiveTab("favorites")
                    }}
                  >
                    <Star className="mr-2 h-4 w-4 text-amber-400" />
                    <span>View Favorite Agents</span>
                  </CommandItem>
                </>
              )}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Tools">
              <CommandItem
                onSelect={() => {
                  setIsCommandOpen(false)
                  handleOpenAnalytics()
                }}
              >
                <BarChart className="mr-2 h-4 w-4" />
                <span>Analytics Dashboard</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setIsCommandOpen(false)
                  handleOpenSettings()
                }}
              >
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setIsCommandOpen(false)
                  handleOpenApiDocs()
                }}
              >
                <Code className="mr-2 h-4 w-4" />
                <span>API Documentation</span>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  setIsCommandOpen(false)
                  setIsKeyboardShortcutsOpen(true)
                }}
              >
                <Keyboard className="mr-2 h-4 w-4" />
                <span>Keyboard Shortcuts</span>
              </CommandItem>
            </CommandGroup>
            {selectedAgent && (
              <>
                <CommandSeparator />
                <CommandGroup heading={`Selected: ${selectedAgent.name}`}>
                  <CommandItem
                    onSelect={() => {
                      setIsCommandOpen(false)
                      handleEditAgent()
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    <span>Edit Agent</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setIsCommandOpen(false)
                      handleIncrementUsage(selectedAgent.id)
                    }}
                  >
                    <Play className="mr-2 h-4 w-4 text-emerald-400" />
                    <span>Run Agent</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setIsCommandOpen(false)
                      handleOpenWorkflow(selectedAgent.name)
                    }}
                  >
                    <Workflow className="mr-2 h-4 w-4" />
                    <span>Open Workflows</span>
                  </CommandItem>
                  <CommandItem
                    onSelect={() => {
                      setIsCommandOpen(false)
                      handleDeleteAgent(selectedAgent.id)
                    }}
                  >
                    <Trash className="mr-2 h-4 w-4 text-rose-400" />
                    <span>Delete Agent</span>
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </CommandDialog>

        {/* Keyboard Shortcuts Dialog */}
        <Dialog open={isKeyboardShortcutsOpen} onOpenChange={setIsKeyboardShortcutsOpen}>
          <DialogContent className="bg-black border border-gray-800 text-white max-w-md p-5">
            <DialogHeader className="space-y-1.5">
              <DialogTitle className="text-base font-medium flex items-center gap-2">
                <Keyboard className="h-4 w-4 text-white" />
                Keyboard Shortcuts
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-xs">
                Master these shortcuts to boost your productivity.
              </DialogDescription>
            </DialogHeader>
            <div className="py-2">
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {KEYBOARD_SHORTCUTS.map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-xs text-gray-300">{shortcut.description}</span>
                    <div className="flex items-center gap-1">
                      {shortcut.modifier && (
                        <kbd className="bg-gray-900 text-[10px] px-2 py-1 rounded border border-gray-800">
                          {shortcut.modifier}
                        </kbd>
                      )}
                      {shortcut.modifier && <span className="text-xs text-gray-400">+</span>}
                      <kbd className="bg-gray-900 text-[10px] px-2 py-1 rounded border border-gray-800">
                        {shortcut.key}
                      </kbd>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <DialogFooter className="pt-1.5">
              <Button
                onClick={() => setIsKeyboardShortcutsOpen(false)}
                className="bg-white text-black hover:bg-gray-100 text-xs h-6"
                size="sm"
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Workflow Dialog */}
        <Dialog open={isWorkflowDialogOpen} onOpenChange={setIsWorkflowDialogOpen}>
          <DialogContent className="bg-black border border-gray-800 text-white max-w-4xl p-4">
            <DialogHeader className="space-y-1">
              <DialogTitle className="text-sm font-medium flex items-center gap-1.5">
                <Workflow className="h-3.5 w-3.5 text-white" />
                {selectedWorkflow ? `${selectedWorkflow} Workflows` : "Workflows"}
              </DialogTitle>
              <DialogDescription className="text-gray-400 text-xs">
                Design and manage automation workflows for this agent.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-3 border border-gray-800 rounded-sm p-4 h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="mx-auto w-10 h-10 mb-2 flex items-center justify-center">
                  <Workflow className="h-10 w-10 text-gray-800" strokeWidth={1} />
                </div>
                <h3 className="text-sm font-medium text-white mb-1">Workflow Designer</h3>
                <p className="text-xs text-gray-400 mb-3 max-w-md mx-auto">
                  Create automated workflows by connecting nodes and defining triggers and actions.
                </p>
                <div className="flex flex-wrap justify-center gap-2 mb-3">
                  <div className="bg-black border border-gray-800 rounded-sm p-2 w-20 h-20 flex flex-col items-center justify-center">
                    <div className="bg-sky-500/10 p-1.5 rounded-sm mb-1">
                      <ArrowRight className="h-4 w-4 text-sky-400" />
                    </div>
                    <span className="text-[10px] text-gray-300">Trigger</span>
                  </div>
                  <div className="bg-black border border-gray-800 rounded-sm p-2 w-20 h-20 flex flex-col items-center justify-center">
                    <div className="bg-violet-500/10 p-1.5 rounded-sm mb-1">
                      <Cog className="h-4 w-4 text-violet-400" />
                    </div>
                    <span className="text-[10px] text-gray-300">Process</span>
                  </div>
                  <div className="bg-black border border-gray-800 rounded-sm p-2 w-20 h-20 flex flex-col items-center justify-center">
                    <div className="bg-emerald-500/10 p-1.5 rounded-sm mb-1">
                      <ArrowDown className="h-4 w-4 text-emerald-400" />
                    </div>
                    <span className="text-[10px] text-gray-300">Output</span>
                  </div>
                </div>
                <Button className="bg-white text-black hover:bg-gray-100 text-xs font-medium" size="sm">
                  <Plus className="h-3 w-3 mr-1.5" />
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Main Content */}
        <div className="px-2 py-4 max-w-[1200px]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-4">
            <motion.h1
              className="text-xl font-medium text-white"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              AI Agents
            </motion.h1>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs border-gray-800"
                    onClick={() => setIsCommandOpen(true)}
                  >
                    <Command className="h-3 w-3 mr-1" />
                    <span className="mr-1">Command</span>
                    <kbd className="bg-gray-900 text-[9px] px-1.5 py-0.5 rounded border border-gray-800">⌘K</kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="text-[9px]">
                  <p>Open command palette (⌘K)</p>
                </TooltipContent>
              </Tooltip>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
  <DialogTrigger asChild>
    <Button className="bg-white text-black hover:bg-neutral-200 text-xs font-medium h-7 px-3 rounded-sm shadow-none">
      <Plus className="h-3 w-3 mr-1" />
      Create Agent
    </Button>
  </DialogTrigger>

  <DialogContent className="bg-black border border-neutral-800 text-white max-w-lg px-6 py-5 rounded-sm shadow-2xl">
    <DialogHeader className="mb-4">
      <DialogTitle className="text-sm font-semibold flex items-center gap-2 tracking-tight">
        <Bot className="h-4 w-4 text-white" />
        Create New AI Agent
      </DialogTitle>
      <DialogDescription className="text-neutral-500 text-xs">
        Fill in the details or choose from predefined agent templates.
      </DialogDescription>
    </DialogHeader>

    <Tabs defaultValue="form">
      <TabsList className="bg-neutral-900 border border-neutral-800 p-0.5 rounded-sm mb-4 flex gap-1">
        <TabsTrigger
          value="form"
          className="flex-1 text-xs text-center py-1 rounded-sm data-[state=active]:bg-neutral-800 hover:bg-neutral-800 transition-colors"
        >
          Custom Agent
        </TabsTrigger>
        <TabsTrigger
          value="templates"
          className="flex-1 text-xs text-center py-1 rounded-sm data-[state=active]:bg-neutral-800 hover:bg-neutral-800 transition-colors"
        >
          Templates
        </TabsTrigger>
      </TabsList>

      <TabsContent value="form" className="animate-in fade-in duration-150">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-neutral-400 font-medium">
              Step {formStep} of 3:{" "}
              {formStep === 1 ? "Basic Info" : formStep === 2 ? "Capabilities" : "Settings"}
            </span>
            <span className="text-xs text-neutral-500">{formProgress}%</span>
          </div>
          <Progress value={formProgress} className="h-1 bg-neutral-800 rounded-sm" />
        </div>

        <CreateAgentForm
          onSubmit={handleCreateAgent}
          updatePreviewAvatar={updatePreviewAvatar}
          previewAvatar={previewAvatar}
          formStep={formStep}
          nextStep={nextFormStep}
          prevStep={prevFormStep}
          isCreating={isCreating}
        />
      </TabsContent>

      <TabsContent value="templates" className="animate-in fade-in duration-150">
        <ScrollArea className="h-[350px] pr-2">
          <div className="grid grid-cols-1 gap-2">
            {AGENT_TEMPLATES.map((template, index) => (
              <TemplateCard
                key={index}
                template={template}
                onUse={handleUseTemplate}
                isCreating={isCreating}
              />
            ))}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  </DialogContent>
</Dialog>

            </motion.div>
          </div>

          {/* Agent List */}
          {agents.length === 0 ? (
            <motion.div
              className="text-center py-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mx-auto w-48 h-48 mb-4 flex items-center justify-center"
              >
            
              </motion.div>
              <motion.h2
                className="text-base font-medium text-white mb-1"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                No AI Agents Created
              </motion.h2>
              <motion.p
                className="text-xs text-gray-400 mb-3 max-w-md mx-auto"
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                Create your first AI agent to automate tasks and enhance your workflow.
              </motion.p>
              <motion.div
                initial={{ y: 5, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Button
                  className="bg-white text-black hover:bg-gray-100 text-xs font-medium"
                  onClick={() => setIsCreateDialogOpen(true)}
                  size="sm"
                >
                  <Plus className="h-3 w-3 mr-1.5" />
                  Create Agent
                </Button>
              </motion.div>
            </motion.div>
          ) : (
            <>
              {/* Filters and Tabs - Only show when agents exist */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    className="mb-3"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="bg-black border border-gray-800 mb-2 w-full md:w-auto h-7">
                          <TabsTrigger value="all" className="text-xs data-[state=active]:bg-gray-900 h-5">
                            All
                          </TabsTrigger>
                          <TabsTrigger value="active" className="text-xs data-[state=active]:bg-gray-900 h-5">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                              Active
                            </div>
                          </TabsTrigger>
                          <TabsTrigger value="maintenance" className="text-xs data-[state=active]:bg-gray-900 h-5">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
                              Maintenance
                            </div>
                          </TabsTrigger>
                          <TabsTrigger value="offline" className="text-xs data-[state=active]:bg-gray-900 h-5">
                            <div className="flex items-center gap-1">
                              <div className="w-1.5 h-1.5 rounded-full bg-rose-400"></div>
                              Offline
                            </div>
                          </TabsTrigger>
                          <TabsTrigger value="favorites" className="text-xs data-[state=active]:bg-gray-900 h-5">
                            <div className="flex items-center gap-1">
                              <Star className="h-2.5 w-2.5 text-amber-400 fill-amber-400" />
                              Favorites
                            </div>
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative w-full md:w-40">
                          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400" />
                          <Input
                            id="agent-search"
                            placeholder="Search agents..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-black border border-gray-800 text-white pl-7 h-7 text-xs"
                          />
                        </div>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="bg-black border-gray-800 text-white h-7 text-xs"
                              size="sm"
                            >
                              <Filter className="w-3 h-3 mr-1" />
                              Filter
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="bg-black border-gray-800 p-2 w-52">
                            <div className="space-y-2">
                              <h4 className="font-medium text-xs text-white">Filter Agents</h4>
                              <div className="space-y-1">
                                <Label htmlFor="filter-status" className="text-xs text-gray-300">
                                  Status
                                </Label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                  <SelectTrigger
                                    id="filter-status"
                                    className="w-full bg-black border-gray-800 text-white h-6 text-xs"
                                  >
                                    <SelectValue placeholder="All Status" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black border-gray-800">
                                    <SelectItem value="all" className="text-white text-xs">
                                      All Status
                                    </SelectItem>
                                    {Object.entries(AGENT_STATUSES).map(([value]) => (
                                      <SelectItem key={value} value={value} className="text-white text-xs">
                                        <div className="flex items-center gap-1">
                                          {AGENT_STATUSES[value as keyof typeof AGENT_STATUSES].icon}
                                          <span>{value}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="filter-type" className="text-xs text-gray-300">
                                  Type
                                </Label>
                                <Select value={filterType} onValueChange={setFilterType}>
                                  <SelectTrigger
                                    id="filter-type"
                                    className="w-full bg-black border-gray-800 text-white h-6 text-xs"
                                  >
                                    <SelectValue placeholder="All Types" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black border-gray-800">
                                    <SelectItem value="all" className="text-white text-xs">
                                      All Types
                                    </SelectItem>
                                    {Object.entries(AGENT_TYPES).map(([value, { label, fullIcon }]) => (
                                      <SelectItem key={value} value={value} className="text-white text-xs">
                                        <div className="flex items-center gap-1">
                                          {fullIcon}
                                          <span>{label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label htmlFor="sort-order" className="text-xs text-gray-300">
                                  Sort Order
                                </Label>
                                <Select
                                  value={sortOrder}
                                  onValueChange={(value) => setSortOrder(value as "asc" | "desc")}
                                >
                                  <SelectTrigger
                                    id="sort-order"
                                    className="w-full bg-black border-gray-800 text-white h-6 text-xs"
                                  >
                                    <SelectValue placeholder="Sort Order" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-black border-gray-800">
                                    <SelectItem value="desc" className="text-white text-xs">
                                      Newest First
                                    </SelectItem>
                                    <SelectItem value="asc" className="text-white text-xs">
                                      Oldest First
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              className="bg-black border-gray-800 text-white h-7 text-xs"
                              size="sm"
                              onClick={() => handleOpenAnalytics()}
                            >
                              <BarChart className="w-3 h-3 mr-1" />
                              Analytics
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-[9px]">
                            <p>View analytics dashboard</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2"
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <AnimatePresence>
                  {filteredAgents.map((agent) => (
                    <motion.div
                      key={agent.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AgentCard
                        agent={agent}
                        onClick={() => handleAgentClick(agent)}
                        onDelete={() => handleDeleteAgent(agent.id)}
                        onFavorite={() => handleToggleFavorite(agent.id)}
                        isSelected={selectedAgent?.id === agent.id}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}

          {/* Selected Agent Details */}
          <AnimatePresence>
            {selectedAgent && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.3 }}
                className="mt-4 bg-black border border-gray-800 rounded-md p-3"
              >
                {isEditMode ? (
                  <EditAgentForm
                    agent={selectedAgent}
                    formData={editFormData}
                    onChange={handleEditFormChange}
                    onSave={handleSaveEdit}
                    onCancel={handleCancelEdit}
                  />
                ) : (
                  <AgentDetails
                    agent={selectedAgent}
                    onEdit={handleEditAgent}
                    onDelete={() => handleDeleteAgent(selectedAgent.id)}
                    onDuplicate={() => handleDuplicateAgent(selectedAgent)}
                    onFavorite={() => handleToggleFavorite(selectedAgent.id)}
                    onUse={() => handleIncrementUsage(selectedAgent.id)}
                    onClose={() => setSelectedAgent(null)}
                    onOpenWorkflow={handleOpenWorkflow}
                    onOpenAnalytics={handleOpenAnalytics}
                    onOpenSettings={handleOpenSettings}
                    onOpenApiDocs={handleOpenApiDocs}
                    formatTimeAgo={formatTimeAgo}
                    getPerformanceColor={getPerformanceColor}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TooltipProvider>
  )
}

interface AgentCardProps {
  agent: Agent
  onClick: () => void
  onDelete: () => void
  onFavorite: () => void
  isSelected: boolean
}

function AgentCard({ agent, onClick, onDelete, onFavorite, isSelected }: AgentCardProps) {
  return (
    <Card
      className={`bg-black border border-gray-800 hover:border-white cursor-pointer transition-colors duration-200 ${
        isSelected ? "border-sky-500" : ""
      }`}
      onClick={onClick}
    >
      <CardHeader className="p-3 pb-1">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6 border border-gray-800">
            <AvatarImage src={agent.avatarUrl || "/placeholder.svg"} alt={agent.name} />
            <AvatarFallback className="bg-gray-900 text-white text-[9px]">
              {agent.name.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xs font-medium text-white">{agent.name}</CardTitle>
            <CardDescription className="text-[9px] text-gray-400">{AGENT_TYPES[agent.type].label}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-1">
        <p className="text-[9px] text-gray-300">{agent.description}</p>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <Badge
            className={`${AGENT_STATUSES[agent.status].bgColor} px-1 py-0 h-3.5 text-[9px] flex items-center gap-0.5`}
          >
            {AGENT_STATUSES[agent.status].icon}
            <span className={`${AGENT_STATUSES[agent.status].color}`}>{AGENT_STATUSES[agent.status].label}</span>
          </Badge>
          {agent.priority && (
            <Badge variant="outline" className="border-gray-800 text-gray-400 text-[9px] px-1 py-0 h-3.5">
              {AGENT_PRIORITIES[agent.priority].label}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full hover:bg-gray-900"
                onClick={onFavorite}
              >
                <Star
                  className={`h-2.5 w-2.5 ${agent.favorited ? "text-amber-400 fill-amber-400" : "text-gray-500"}`}
                />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px]">
              <p>{agent.favorited ? "Remove from favorites" : "Add to favorites"}</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 rounded-full hover:bg-gray-900" onClick={onDelete}>
                <Trash className="h-2.5 w-2.5 text-gray-500" />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="text-[10px]">
              <p>Delete agent</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </CardFooter>
    </Card>
  )
}

