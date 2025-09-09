"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Save, Settings } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface SystemSettings {
  siteName: string
  siteDescription: string
  contactEmail: string
  maintenanceMode: boolean
  allowRegistration: boolean
  requireEmailVerification: boolean
  maxProjectsPerPublisher: number
  autoApproveProjects: boolean
  enableComments: boolean
  moderateComments: boolean
  publisherPasscodes: string[]
  announcementText: string
  showAnnouncement: boolean
}

export function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPasscode, setNewPasscode] = useState("")
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        // Transform API response to match component expectations
        const transformedSettings: SystemSettings = {
          siteName: "Niger State Platform",
          siteDescription: "Government project monitoring and community engagement platform",
          contactEmail: "admin@nigerstate.gov.ng",
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: true,
          maxProjectsPerPublisher: 10,
          autoApproveProjects: false,
          enableComments: true,
          moderateComments: true,
          publisherPasscodes: [],
          announcementText: "",
          showAnnouncement: false
        }
        setSettings(transformedSettings)
        setRecentActivity(data.recentActivity || [])
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        toast({
          title: "Settings saved",
          description: "System settings have been updated successfully.",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const addPasscode = () => {
    if (!settings || !newPasscode.trim()) return

    setSettings({
      ...settings,
      publisherPasscodes: [...settings.publisherPasscodes, newPasscode.trim()],
    })
    setNewPasscode("")
  }

  const removePasscode = (index: number) => {
    if (!settings) return

    setSettings({
      ...settings,
      publisherPasscodes: settings.publisherPasscodes.filter((_, i) => i !== index),
    })
  }

  if (loading) {
    return <div className="text-center py-8">Loading system settings...</div>
  }

  if (!settings) {
    return <div className="text-center py-8">Failed to load system settings</div>
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            General Settings
          </CardTitle>
          <CardDescription>Configure basic site information and behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="siteName">Site Name</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="contactEmail">Contact Email</Label>
              <Input
                id="contactEmail"
                type="email"
                value={settings.contactEmail}
                onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="siteDescription">Site Description</Label>
            <Textarea
              id="siteDescription"
              value={settings.siteDescription}
              onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Control user registration and authentication</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowRegistration">Allow New Registrations</Label>
              <p className="text-sm text-muted-foreground">Allow new users to create accounts</p>
            </div>
            <Switch
              id="allowRegistration"
              checked={settings.allowRegistration}
              onCheckedChange={(checked) => setSettings({ ...settings, allowRegistration: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireEmailVerification">Require Email Verification</Label>
              <p className="text-sm text-muted-foreground">
                Users must verify their email before accessing the platform
              </p>
            </div>
            <Switch
              id="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maintenanceMode">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">Temporarily disable public access to the site</p>
            </div>
            <Switch
              id="maintenanceMode"
              checked={settings.maintenanceMode}
              onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Publisher Settings</CardTitle>
          <CardDescription>Configure publisher permissions and passcodes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="maxProjects">Max Projects per Publisher</Label>
            <Input
              id="maxProjects"
              type="number"
              value={settings.maxProjectsPerPublisher}
              onChange={(e) => setSettings({ ...settings, maxProjectsPerPublisher: Number.parseInt(e.target.value) })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="autoApprove">Auto-approve Projects</Label>
              <p className="text-sm text-muted-foreground">Automatically approve new project submissions</p>
            </div>
            <Switch
              id="autoApprove"
              checked={settings.autoApproveProjects}
              onCheckedChange={(checked) => setSettings({ ...settings, autoApproveProjects: checked })}
            />
          </div>
          <Separator />
          <div>
            <Label>Publisher Passcodes</Label>
            <p className="text-sm text-muted-foreground mb-2">Manage passcodes for publisher role elevation</p>
            <div className="space-y-2">
              {settings.publisherPasscodes.map((passcode, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input value={passcode} readOnly />
                  <Button variant="destructive" size="sm" onClick={() => removePasscode(index)}>
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Enter new passcode"
                  value={newPasscode}
                  onChange={(e) => setNewPasscode(e.target.value)}
                />
                <Button onClick={addPasscode}>Add</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Content Settings</CardTitle>
          <CardDescription>Configure content moderation and comments</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="enableComments">Enable Comments</Label>
              <p className="text-sm text-muted-foreground">Allow users to comment on projects</p>
            </div>
            <Switch
              id="enableComments"
              checked={settings.enableComments}
              onCheckedChange={(checked) => setSettings({ ...settings, enableComments: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="moderateComments">Moderate Comments</Label>
              <p className="text-sm text-muted-foreground">Require admin approval for new comments</p>
            </div>
            <Switch
              id="moderateComments"
              checked={settings.moderateComments}
              onCheckedChange={(checked) => setSettings({ ...settings, moderateComments: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
          <CardDescription>Display important messages to users</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="showAnnouncement">Show Announcement</Label>
              <p className="text-sm text-muted-foreground">Display announcement banner on the site</p>
            </div>
            <Switch
              id="showAnnouncement"
              checked={settings.showAnnouncement}
              onCheckedChange={(checked) => setSettings({ ...settings, showAnnouncement: checked })}
            />
          </div>
          <div>
            <Label htmlFor="announcementText">Announcement Text</Label>
            <Textarea
              id="announcementText"
              placeholder="Enter announcement message..."
              value={settings.announcementText}
              onChange={(e) => setSettings({ ...settings, announcementText: e.target.value })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
