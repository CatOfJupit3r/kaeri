"use client"

import type React from "react"

import { useState } from "react"
import {
  ArrowLeft,
  Settings,
  Users,
  Shield,
  Bell,
  Palette,
  FileText,
  Trash2,
  Plus,
  Crown,
  Edit2,
  Upload,
  Globe,
  Lock,
  Archive,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProjectSettingsProps {
  onBack: () => void
}

type SettingsTab = "general" | "team" | "permissions" | "notifications" | "appearance" | "export" | "danger"

const mockTeamMembers = [
  { id: "1", name: "John Doe", email: "john@example.com", role: "owner", avatar: "JD" },
  { id: "2", name: "Sarah Miller", email: "sarah@example.com", role: "admin", avatar: "SM" },
  { id: "3", name: "Maya Rodriguez", email: "maya@example.com", role: "writer", avatar: "MR" },
  { id: "4", name: "Jack Chen", email: "jack@example.com", role: "viewer", avatar: "JC" },
]

export function ProjectSettings({ onBack }: ProjectSettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general")
  const [projectName, setProjectName] = useState("Coffee Shop Chronicles")
  const [projectDescription, setProjectDescription] = useState(
    "A drama series exploring human connections in an urban setting",
  )
  const [projectType, setProjectType] = useState("tv-series")
  const [visibility, setVisibility] = useState("private")

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "general", label: "General", icon: <Settings className="h-4 w-4" /> },
    { id: "team", label: "Team", icon: <Users className="h-4 w-4" /> },
    { id: "permissions", label: "Permissions", icon: <Shield className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
    { id: "export", label: "Export", icon: <FileText className="h-4 w-4" /> },
    { id: "danger", label: "Danger Zone", icon: <Trash2 className="h-4 w-4" /> },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Information</CardTitle>
                <CardDescription>Basic details about your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-6">
                  <div className="relative">
                    <div className="flex h-24 w-24 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-7 w-7 rounded-full p-0 bg-transparent"
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="project-name">Project Name</Label>
                      <Input id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project-type">Project Type</Label>
                      <Select value={projectType} onValueChange={setProjectType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="tv-series">TV Series</SelectItem>
                          <SelectItem value="film-trilogy">Film Trilogy</SelectItem>
                          <SelectItem value="anthology">Anthology</SelectItem>
                          <SelectItem value="standalone">Standalone</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={projectDescription}
                    onChange={(e) => setProjectDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <div className="flex gap-3">
                    <Button
                      variant={visibility === "private" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVisibility("private")}
                      className="gap-2"
                    >
                      <Lock className="h-4 w-4" />
                      Private
                    </Button>
                    <Button
                      variant={visibility === "team" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVisibility("team")}
                      className="gap-2"
                    >
                      <Users className="h-4 w-4" />
                      Team Only
                    </Button>
                    <Button
                      variant={visibility === "public" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setVisibility("public")}
                      className="gap-2"
                    >
                      <Globe className="h-4 w-4" />
                      Public
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Stats</CardTitle>
                <CardDescription>Overview of your project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Total Scripts</p>
                    <p className="text-2xl font-bold">12</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Total Words</p>
                    <p className="text-2xl font-bold">87,432</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Team Members</p>
                    <p className="text-2xl font-bold">4</p>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">Created</p>
                    <p className="text-2xl font-bold">Nov 1</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>Save Changes</Button>
            </div>
          </div>
        )

      case "team":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>Manage who has access to this project</CardDescription>
                </div>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Invite Member
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockTeamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-lg border border-border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {member.avatar}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{member.name}</p>
                            {member.role === "owner" && <Crown className="h-4 w-4 text-yellow-500" />}
                          </div>
                          <p className="text-sm text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant={
                            member.role === "owner" ? "default" : member.role === "admin" ? "secondary" : "outline"
                          }
                        >
                          {member.role}
                        </Badge>
                        {member.role !== "owner" && (
                          <Select defaultValue={member.role}>
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="writer">Writer</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>Invitations that haven't been accepted yet</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Users className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">alex@example.com</p>
                      <p className="text-sm text-muted-foreground">Invited 2 days ago as Writer</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "permissions":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Role Permissions</CardTitle>
                <CardDescription>Configure what each role can do in this project</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {["Admin", "Writer", "Viewer"].map((role) => (
                    <div key={role} className="space-y-3">
                      <h4 className="font-medium">{role}</h4>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <span className="text-sm">Edit Scripts</span>
                          <Switch defaultChecked={role !== "Viewer"} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <span className="text-sm">Delete Scripts</span>
                          <Switch defaultChecked={role === "Admin"} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <span className="text-sm">Edit Knowledge Base</span>
                          <Switch defaultChecked={role !== "Viewer"} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <span className="text-sm">Export Project</span>
                          <Switch defaultChecked={role === "Admin"} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <span className="text-sm">Invite Members</span>
                          <Switch defaultChecked={role === "Admin"} />
                        </div>
                        <div className="flex items-center justify-between rounded-lg border border-border p-3">
                          <span className="text-sm">View Analytics</span>
                          <Switch defaultChecked />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Notifications</CardTitle>
                <CardDescription>Choose what events trigger notifications for team members</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "New script added", description: "When a new script is created in the project" },
                  { label: "Script edited", description: "When someone edits an existing script" },
                  { label: "Comments added", description: "When someone adds comments to a script" },
                  { label: "Status changes", description: "When a script's status changes (draft, review, final)" },
                  { label: "New team member", description: "When someone joins the project" },
                  { label: "Knowledge base updates", description: "When the knowledge base is modified" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )

      case "appearance":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Theme</CardTitle>
                <CardDescription>Customize the look and feel of this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Accent Color</Label>
                  <div className="flex gap-3">
                    {["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"].map((color) => (
                      <button
                        key={color}
                        className="h-10 w-10 rounded-full border-2 border-transparent ring-offset-2 ring-offset-background transition-all hover:scale-110 focus:ring-2 focus:ring-ring"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Project Icon</Label>
                  <div className="flex gap-3">
                    {["📺", "🎬", "📽️", "🎭", "✍️", "📚"].map((emoji) => (
                      <button
                        key={emoji}
                        className="flex h-12 w-12 items-center justify-center rounded-lg border border-border text-2xl transition-all hover:border-primary hover:bg-muted"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <Label>Cover Image</Label>
                  <div className="flex h-32 items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30">
                    <div className="text-center">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Drop an image or click to upload</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Editor Preferences</CardTitle>
                <CardDescription>Default settings for the script editor in this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show line numbers</p>
                    <p className="text-sm text-muted-foreground">Display line numbers in the editor</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Show page breaks</p>
                    <p className="text-sm text-muted-foreground">Visual indicators for page breaks</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Auto-save</p>
                    <p className="text-sm text-muted-foreground">Automatically save changes</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "export":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Export Settings</CardTitle>
                <CardDescription>Configure default export options for this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Default Export Format</Label>
                  <Select defaultValue="pdf">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">Hollywood-Standard PDF</SelectItem>
                      <SelectItem value="fdx">Final Draft (.fdx)</SelectItem>
                      <SelectItem value="fountain">Fountain (.fountain)</SelectItem>
                      <SelectItem value="docx">Word Document (.docx)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm">Include title page</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm">Include scene numbers</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm">Include page numbers</span>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <span className="text-sm">Include revision marks</span>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>Configure automatic backups for this project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Automatic Backups</p>
                    <p className="text-sm text-muted-foreground">Create backups every 24 hours</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label>Backup Retention</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Archive className="h-4 w-4" />
                  Download Full Backup
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case "danger":
        return (
          <div className="space-y-6">
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions that can affect your project</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Archive Project</p>
                    <p className="text-sm text-muted-foreground">Hide project from dashboard but keep all data</p>
                  </div>
                  <Button variant="outline">Archive</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Transfer Ownership</p>
                    <p className="text-sm text-muted-foreground">Transfer this project to another team member</p>
                  </div>
                  <Button variant="outline">Transfer</Button>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
                  <div>
                    <p className="font-medium text-destructive">Delete Project</p>
                    <p className="text-sm text-muted-foreground">Permanently delete this project and all its data</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the project and all associated
                          scripts, knowledge base entries, and settings.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                          Delete Project
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <div className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-card px-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-semibold">Project Settings</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-56 shrink-0 border-r border-border bg-card p-4">
          <nav className="space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground"
                    : tab.id === "danger"
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto max-w-3xl">{renderTabContent()}</div>
        </main>
      </div>
    </div>
  )
}
