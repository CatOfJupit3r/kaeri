"use client"

import type React from "react"

import { useState } from "react"
import {
  ArrowLeft,
  User,
  Bell,
  Palette,
  Keyboard,
  Shield,
  CreditCard,
  HelpCircle,
  LogOut,
  Moon,
  Sun,
  Monitor,
  Edit2,
  Upload,
  Check,
  Globe,
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

interface UserSettingsProps {
  onBack: () => void
}

type SettingsTab = "profile" | "notifications" | "appearance" | "shortcuts" | "security" | "billing" | "help"

export function UserSettings({ onBack }: UserSettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile")
  const [theme, setTheme] = useState<"light" | "dark" | "system">("system")
  const [userName, setUserName] = useState("John Doe")
  const [userEmail, setUserEmail] = useState("john@example.com")
  const [userBio, setUserBio] = useState(
    "Screenwriter and storyteller. Currently working on a drama series about human connections.",
  )

  const tabs: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: "profile", label: "Profile", icon: <User className="h-4 w-4" /> },
    { id: "notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance", icon: <Palette className="h-4 w-4" /> },
    { id: "shortcuts", label: "Keyboard Shortcuts", icon: <Keyboard className="h-4 w-4" /> },
    { id: "security", label: "Security", icon: <Shield className="h-4 w-4" /> },
    { id: "billing", label: "Billing", icon: <CreditCard className="h-4 w-4" /> },
    { id: "help", label: "Help & Support", icon: <HelpCircle className="h-4 w-4" /> },
  ]

  const shortcuts = [
    { action: "Save", keys: ["Ctrl", "S"] },
    { action: "Undo", keys: ["Ctrl", "Z"] },
    { action: "Redo", keys: ["Ctrl", "Shift", "Z"] },
    { action: "Bold", keys: ["Ctrl", "B"] },
    { action: "Italic", keys: ["Ctrl", "I"] },
    { action: "Scene Heading", keys: ["Ctrl", "1"] },
    { action: "Action", keys: ["Ctrl", "2"] },
    { action: "Character", keys: ["Ctrl", "3"] },
    { action: "Dialogue", keys: ["Ctrl", "4"] },
    { action: "Parenthetical", keys: ["Ctrl", "5"] },
    { action: "Transition", keys: ["Ctrl", "6"] },
    { action: "Toggle Sidebar", keys: ["Ctrl", "\\"] },
    { action: "Quick Search", keys: ["Ctrl", "K"] },
    { action: "Export", keys: ["Ctrl", "E"] },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details and public profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarFallback className="bg-primary text-2xl text-primary-foreground">JD</AvatarFallback>
                    </Avatar>
                    <Button
                      size="sm"
                      variant="outline"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0 bg-transparent"
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Upload className="h-4 w-4" />
                      Upload Photo
                    </Button>
                    <p className="text-xs text-muted-foreground">JPG, PNG or GIF. Max 2MB.</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={userName} onChange={(e) => setUserName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="flex">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">
                      @
                    </span>
                    <Input id="username" defaultValue="johndoe" className="rounded-l-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={userBio}
                    onChange={(e) => setUserBio(e.target.value)}
                    rows={3}
                    placeholder="Tell others a bit about yourself..."
                  />
                  <p className="text-xs text-muted-foreground">{userBio.length}/200 characters</p>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <Input defaultValue="Los Angeles, CA" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Professional Info</CardTitle>
                <CardDescription>Your professional credentials and experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Roles</Label>
                  <div className="flex flex-wrap gap-2">
                    {["Screenwriter", "Director", "Producer", "Editor"].map((role) => (
                      <Badge key={role} variant="secondary" className="cursor-pointer">
                        {role}
                      </Badge>
                    ))}
                    <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                      + Add Role
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>IMDB Profile</Label>
                  <Input placeholder="https://www.imdb.com/name/..." />
                </div>
                <div className="space-y-2">
                  <Label>Portfolio Website</Label>
                  <Input placeholder="https://..." />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-3">
              <Button variant="outline">Cancel</Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        )

      case "notifications":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>Choose what emails you want to receive</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Project invitations", description: "When someone invites you to a project", default: true },
                  { label: "Script comments", description: "When someone comments on your scripts", default: true },
                  { label: "Script mentions", description: "When someone mentions you in a script", default: true },
                  { label: "Weekly digest", description: "Weekly summary of your project activity", default: false },
                  { label: "Product updates", description: "New features and improvements", default: true },
                  { label: "Tips & tutorials", description: "Screenwriting tips and how-to guides", default: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Switch defaultChecked={item.default} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>Browser and mobile notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Enable push notifications</p>
                    <p className="text-sm text-muted-foreground">Get notified in real-time</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Sound</p>
                    <p className="text-sm text-muted-foreground">Play sound with notifications</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "appearance":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>Choose how the app looks to you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { id: "light", label: "Light", icon: <Sun className="h-5 w-5" /> },
                    { id: "dark", label: "Dark", icon: <Moon className="h-5 w-5" /> },
                    { id: "system", label: "System", icon: <Monitor className="h-5 w-5" /> },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setTheme(option.id as typeof theme)}
                      className={`flex flex-col items-center gap-3 rounded-lg border-2 p-4 transition-colors ${
                        theme === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <div
                        className={`rounded-full p-3 ${
                          theme === option.id ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        {option.icon}
                      </div>
                      <span className="font-medium">{option.label}</span>
                      {theme === option.id && <Check className="h-4 w-4 text-primary" />}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Editor Preferences</CardTitle>
                <CardDescription>Customize your writing experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select defaultValue="16">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12px</SelectItem>
                      <SelectItem value="14">14px</SelectItem>
                      <SelectItem value="16">16px</SelectItem>
                      <SelectItem value="18">18px</SelectItem>
                      <SelectItem value="20">20px</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Editor Font</Label>
                  <Select defaultValue="inter">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inter">Inter</SelectItem>
                      <SelectItem value="courier">Courier New</SelectItem>
                      <SelectItem value="monaco">Monaco</SelectItem>
                      <SelectItem value="georgia">Georgia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Focus Mode</p>
                    <p className="text-sm text-muted-foreground">Dim everything except current paragraph</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Typewriter Mode</p>
                    <p className="text-sm text-muted-foreground">Keep current line centered</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sidebar</CardTitle>
                <CardDescription>Customize sidebar behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Collapsed by default</p>
                    <p className="text-sm text-muted-foreground">Start with sidebar collapsed</p>
                  </div>
                  <Switch />
                </div>
                <div className="space-y-2">
                  <Label>Default panel</Label>
                  <Select defaultValue="knowledge">
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="knowledge">Knowledge Base</SelectItem>
                      <SelectItem value="canvas">Canvas</SelectItem>
                      <SelectItem value="assistant">AI Assistant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "shortcuts":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Keyboard Shortcuts</CardTitle>
                <CardDescription>Quick access to common actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {shortcuts.map((shortcut) => (
                    <div
                      key={shortcut.action}
                      className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                    >
                      <span className="text-sm">{shortcut.action}</span>
                      <div className="flex gap-1">
                        {shortcut.keys.map((key, i) => (
                          <kbd key={i} className="rounded bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Shortcuts</CardTitle>
                <CardDescription>Create your own keyboard shortcuts</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="gap-2 bg-transparent">
                  <Keyboard className="h-4 w-4" />
                  Add Custom Shortcut
                </Button>
              </CardContent>
            </Card>
          </div>
        )

      case "security":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>Change your password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
                <Button>Update Password</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Shield className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Authenticator App</p>
                      <p className="text-sm text-muted-foreground">Use an app like Google Authenticator</p>
                    </div>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your logged-in devices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { device: "MacBook Pro", location: "Los Angeles, CA", current: true },
                  { device: "iPhone 15", location: "Los Angeles, CA", current: false },
                  { device: "Chrome on Windows", location: "New York, NY", current: false },
                ].map((session, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{session.device}</p>
                        {session.current && <Badge variant="secondary">Current</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{session.location}</p>
                    </div>
                    {!session.current && (
                      <Button variant="ghost" size="sm" className="text-destructive">
                        Revoke
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )

      case "billing":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Current Plan</CardTitle>
                <CardDescription>Your subscription details</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-primary bg-primary/5 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-semibold">Pro Plan</p>
                      <Badge>Active</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">$19/month · Renews Jan 15, 2026</p>
                  </div>
                  <Button variant="outline">Manage</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Usage</CardTitle>
                <CardDescription>Your current usage this billing period</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Projects", used: 8, total: 20 },
                  { label: "Team Members", used: 4, total: 10 },
                  { label: "AI Assistant Credits", used: 450, total: 1000 },
                  { label: "Storage", used: 2.4, total: 10, unit: "GB" },
                ].map((item) => (
                  <div key={item.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{item.label}</span>
                      <span className="text-muted-foreground">
                        {item.used} / {item.total} {item.unit || ""}
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(item.used / item.total) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>Manage your payment information</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <CreditCard className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/26</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Update
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )

      case "help":
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Help Resources</CardTitle>
                <CardDescription>Get help with using the platform</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                {[
                  { icon: "📚", title: "Documentation", description: "Browse our guides and tutorials" },
                  { icon: "💬", title: "Community", description: "Join discussions with other writers" },
                  { icon: "🎥", title: "Video Tutorials", description: "Learn with step-by-step videos" },
                  { icon: "❓", title: "FAQ", description: "Find answers to common questions" },
                ].map((item) => (
                  <button
                    key={item.title}
                    className="flex items-start gap-3 rounded-lg border border-border p-4 text-left transition-colors hover:bg-muted"
                  >
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Support</CardTitle>
                <CardDescription>Can't find what you're looking for?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input placeholder="What do you need help with?" />
                </div>
                <div className="space-y-2">
                  <Label>Message</Label>
                  <Textarea placeholder="Describe your issue..." rows={4} />
                </div>
                <Button>Send Message</Button>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-destructive">Sign Out</CardTitle>
                <CardDescription>Sign out of your account on this device</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </Button>
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
          Back
        </Button>
        <div className="h-4 w-px bg-border" />
        <h1 className="text-lg font-semibold">User Settings</h1>
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
