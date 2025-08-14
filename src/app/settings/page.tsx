'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Settings, Save, RefreshCw, Building, DollarSign, Bell, Wrench, Users, Shield, Crown, User, Briefcase, Activity, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'
import { usePermissions } from '@/contexts/permissions-context'
import { defaultSettingsPermissions } from '@/lib/permissions'
import { apiGet, apiPut } from '@/lib/api'

interface SettingsData {
  id: string
  currencySymbol: string
  currencyCode: string
  currencyName: string
  decimalPlaces: number
  thousandsSeparator: string
  decimalSeparator: string
  symbolPosition: 'before' | 'after'
  companyName?: string
  companyAddress?: string
  companyPhone?: string
  companyEmail?: string
  timezone: string
  dateFormat: string
  maintenanceIntervals?: {
    oilChange?: number
    tireRotation?: number
    brakeInspection?: number
    engineTuneUp?: number
    transmissionService?: number
  }
  notifications?: {
    email?: boolean
    upcomingMaintenance?: boolean
    overdueMaintenance?: boolean
    lowStock?: boolean
  }
  rolePermissions?: any
  userPermissions?: any
  createdAt: string
  updatedAt: string
}

interface UserActivity {
  id: string
  userId: string
  action: string
  entityType: string
  entityId?: string
  entityName?: string
  ipAddress?: string
  createdAt: string
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

interface LoginHistory {
  id: string
  userId: string
  loginTime: string
  logoutTime?: string
  ipAddress?: string
  sessionDuration?: number
  isActive: boolean
  user?: {
    id: string
    name: string
    email: string
    role: string
  }
}

// Simplified role definitions
const roleDefinitions = {
  ADMIN: {
    name: 'Admin',
    description: 'Full access to everything',
    icon: Crown,
    color: 'destructive',
    permissions: {
      dashboard: 'Can view dashboard',
      trucks: 'Can add, edit, delete trucks',
      maintenance: 'Can manage all maintenance',
      mechanics: 'Can manage mechanics',
      reports: 'Can view and create reports',
      users: 'Can manage users',
      settings: 'Can change settings',
      admin: 'Full admin access'
    }
  },
  MANAGER: {
    name: 'Manager',
    description: 'Can manage most operations',
    icon: Briefcase,
    color: 'default',
    permissions: {
      dashboard: 'Can view dashboard',
      trucks: 'Can add and edit trucks',
      maintenance: 'Can manage maintenance',
      mechanics: 'Can manage mechanics',
      reports: 'Can view and create reports',
      users: 'Can view users only',
      settings: 'Can view settings',
      admin: 'No admin access'
    }
  },
  USER: {
    name: 'User',
    description: 'Basic read-only access',
    icon: User,
    color: 'secondary',
    permissions: {
      dashboard: 'Can view dashboard',
      trucks: 'Can view trucks only',
      maintenance: 'Can view maintenance only',
      mechanics: 'Can view mechanics only',
      reports: 'No report access',
      users: 'No user access',
      settings: 'No settings access',
      admin: 'No admin access'
    }
  }
}

export default function SettingsPage() {
  const { isAdmin } = useAuth()
  const { canAccess, refreshPermissions } = usePermissions()
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [loginHistory, setLoginHistory] = useState<LoginHistory[]>([])
  const [activityLoading, setActivityLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    if (canAccess('settings')) {
      fetchSettings()
    }
  }, [canAccess])

  useEffect(() => {
    if (isAdmin) {
      fetchActivityData()
    }
  }, [isAdmin])

  const fetchSettings = async () => {
    try {
      const response = await apiGet('/api/settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      } else {
        toast.error('Failed to fetch settings')
      }
    } catch (error) {
      toast.error('Failed to fetch settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchActivityData = async () => {
    if (!isAdmin) return
    
    setActivityLoading(true)
    try {
      const [activitiesResponse, loginResponse] = await Promise.all([
        fetch('/api/admin/activities?limit=25'),
        fetch('/api/admin/login-history?limit=25')
      ])

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json()
        setUserActivities(activitiesData.activities || [])
      }

      if (loginResponse.ok) {
        const loginData = await loginResponse.json()
        setLoginHistory(loginData.history || [])
      }
    } catch (error) {
      console.error('Error fetching activity data:', error)
      toast.error('Failed to fetch activity data')
    } finally {
      setActivityLoading(false)
    }
  }

  const updateSettings = (field: keyof SettingsData, value: any) => {
    if (settings) {
      const updatedSettings = { ...settings, [field]: value }
      setSettings(updatedSettings)
      setHasChanges(true)
    }
  }

  const updateNestedSettings = (parent: keyof SettingsData, field: string, value: any) => {
    if (settings) {
      const updatedSettings = { 
        ...settings, 
        [parent]: {
          ...settings[parent] as any,
          [field]: value
        }
      }
      setSettings(updatedSettings)
      setHasChanges(true)
    }
  }

  const updateRolePermission = (role: string, permissionType: string, enabled: boolean) => {
    if (!settings) return

    const rolePermissions = settings.rolePermissions || { ...defaultSettingsPermissions.rolePermissions }
    
    // Check if we're dealing with object format or array format
    const currentPermissions = rolePermissions[role]
    const isArrayFormat = Array.isArray(currentPermissions)
    
    if (!rolePermissions[role]) {
      if (isArrayFormat) {
        rolePermissions[role] = []
      } else {
        // Initialize with default permissions object
        rolePermissions[role] = {
          canViewDashboard: false,
          canViewTrucks: false,
          canAddTrucks: false,
          canEditTrucks: false,
          canDeleteTrucks: false,
          canViewMaintenance: false,
          canAddMaintenance: false,
          canEditMaintenance: false,
          canDeleteMaintenance: false,
          canViewMechanics: false,
          canAddMechanics: false,
          canEditMechanics: false,
          canDeleteMechanics: false,
          canViewReports: false,
          canViewUsers: false,
          canManageUsers: false,
          canViewSettings: false,
          canManageSettings: false,
          canViewAdmin: false,
          canManageAdmin: false
        }
      }
    }
    
    if (isArrayFormat) {
      // Array format handling (original logic)
      const permissionMap = {
        'dashboard': { resource: 'dashboard', actions: ['read'] },
        'trucks': { resource: 'trucks', actions: ['read', 'create', 'update'] },
        'trucks-delete': { resource: 'trucks', actions: ['delete'] },
        'maintenance': { resource: 'maintenance', actions: ['read', 'create', 'update'] },
        'maintenance-delete': { resource: 'maintenance', actions: ['delete'] },
        'mechanics': { resource: 'mechanics', actions: ['read', 'create', 'update'] },
        'mechanics-delete': { resource: 'mechanics', actions: ['delete'] },
        'reports': { resource: 'reports', actions: ['read', 'create', 'export'] },
        'users': { resource: 'users', actions: ['read'] },
        'users-manage': { resource: 'users', actions: ['create', 'update', 'delete'] },
        'settings': { resource: 'settings', actions: ['read'] },
        'settings-manage': { resource: 'settings', actions: ['update'] },
        'admin': { resource: 'admin', actions: ['read', 'update'] }
      }

      const permission = permissionMap[permissionType as keyof typeof permissionMap]
      if (!permission) return

      const permissionIndex = rolePermissions[role].findIndex((p: any) => p.resource === permission.resource)
      
      if (permissionIndex >= 0) {
        if (enabled) {
          permission.actions.forEach(action => {
            if (!rolePermissions[role][permissionIndex].actions.includes(action)) {
              rolePermissions[role][permissionIndex].actions.push(action)
            }
          })
        } else {
          permission.actions.forEach(action => {
            rolePermissions[role][permissionIndex].actions = rolePermissions[role][permissionIndex].actions.filter((a: string) => a !== action)
          })
          // Remove permission if no actions left
          if (rolePermissions[role][permissionIndex].actions.length === 0) {
            rolePermissions[role].splice(permissionIndex, 1)
          }
        }
      } else if (enabled) {
        rolePermissions[role].push({ resource: permission.resource, actions: [...permission.actions] })
      }
    } else {
      // Object format handling
      const permissionUpdates: Record<string, (obj: any, enabled: boolean) => void> = {
        'dashboard': (obj, enabled) => { obj.canViewDashboard = enabled },
        'trucks': (obj, enabled) => { 
          obj.canViewTrucks = enabled
          obj.canAddTrucks = enabled
          obj.canEditTrucks = enabled
        },
        'trucks-delete': (obj, enabled) => { obj.canDeleteTrucks = enabled },
        'maintenance': (obj, enabled) => { 
          obj.canViewMaintenance = enabled
          obj.canAddMaintenance = enabled
          obj.canEditMaintenance = enabled
        },
        'maintenance-delete': (obj, enabled) => { obj.canDeleteMaintenance = enabled },
        'mechanics': (obj, enabled) => { 
          obj.canViewMechanics = enabled
          obj.canAddMechanics = enabled
          obj.canEditMechanics = enabled
        },
        'mechanics-delete': (obj, enabled) => { obj.canDeleteMechanics = enabled },
        'reports': (obj, enabled) => { obj.canViewReports = enabled },
        'users': (obj, enabled) => { obj.canViewUsers = enabled },
        'users-manage': (obj, enabled) => { obj.canManageUsers = enabled },
        'settings': (obj, enabled) => { obj.canViewSettings = enabled },
        'settings-manage': (obj, enabled) => { obj.canManageSettings = enabled },
        'admin': (obj, enabled) => { obj.canViewAdmin = enabled }
      }
      
      const updater = permissionUpdates[permissionType]
      if (updater) {
        updater(rolePermissions[role], enabled)
      }
    }

    updateSettings('rolePermissions', rolePermissions)
  }

  const hasPermission = (role: string, permissionType: string): boolean => {
    if (!settings) return false

    const rolePermissions = settings.rolePermissions || defaultSettingsPermissions.rolePermissions
    const permissions = rolePermissions[role] || []

    // Handle both object format (from API) and array format (for UI)
    const isArrayFormat = Array.isArray(permissions)
    
    const permissionMap = {
      'dashboard': { resource: 'dashboard', actions: ['read'] },
      'trucks': { resource: 'trucks', actions: ['read', 'create', 'update'] },
      'trucks-delete': { resource: 'trucks', actions: ['delete'] },
      'maintenance': { resource: 'maintenance', actions: ['read', 'create', 'update'] },
      'maintenance-delete': { resource: 'maintenance', actions: ['delete'] },
      'mechanics': { resource: 'mechanics', actions: ['read', 'create', 'update'] },
      'mechanics-delete': { resource: 'mechanics', actions: ['delete'] },
      'reports': { resource: 'reports', actions: ['read', 'create', 'export'] },
      'users': { resource: 'users', actions: ['read'] },
      'users-manage': { resource: 'users', actions: ['create', 'update', 'delete'] },
      'settings': { resource: 'settings', actions: ['read'] },
      'settings-manage': { resource: 'settings', actions: ['update'] },
      'admin': { resource: 'admin', actions: ['read', 'update'] }
    }

    const permission = permissionMap[permissionType as keyof typeof permissionMap]
    if (!permission) return false

    if (isArrayFormat) {
      // Array format: [{ resource: 'trucks', actions: ['read', 'create'] }]
      return permissions.some((p: any) => 
        p.resource === permission.resource && 
        permission.actions.every(action => p.actions.includes(action))
      )
    } else {
      // Object format: { canViewTrucks: true, canAddTrucks: false, ... }
      const permissionChecks: Record<string, (obj: any) => boolean> = {
        'dashboard': (obj) => obj.canViewDashboard,
        'trucks': (obj) => obj.canViewTrucks && obj.canAddTrucks && obj.canEditTrucks,
        'trucks-delete': (obj) => obj.canDeleteTrucks,
        'maintenance': (obj) => obj.canViewMaintenance && obj.canAddMaintenance && obj.canEditMaintenance,
        'maintenance-delete': (obj) => obj.canDeleteMaintenance,
        'mechanics': (obj) => obj.canViewMechanics && obj.canAddMechanics && obj.canEditMechanics,
        'mechanics-delete': (obj) => obj.canDeleteMechanics,
        'reports': (obj) => obj.canViewReports,
        'users': (obj) => obj.canViewUsers,
        'users-manage': (obj) => obj.canManageUsers,
        'settings': (obj) => obj.canViewSettings,
        'settings-manage': (obj) => obj.canManageSettings,
        'admin': (obj) => obj.canViewAdmin
      }
      
      const checker = permissionChecks[permissionType]
      return checker ? checker(permissions) : false
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const response = await apiPut('/api/settings', settings)

      if (response.ok) {
        const updatedSettings = await response.json()
        setSettings(updatedSettings)
        setHasChanges(false)
        refreshPermissions()
        toast.success('Settings saved successfully!')
      } else {
        toast.error('Failed to save settings')
      }
    } catch (error) {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    fetchSettings()
    setHasChanges(false)
  }

  if (!canAccess('settings')) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access settings.</p>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-semibold mb-2">Settings Not Available</h2>
          <p className="text-gray-600">Unable to load settings. Please try again.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">Configure your fleet management system</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="currency">Currency</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          {isAdmin && <TabsTrigger value="roles">Roles</TabsTrigger>}
          {isAdmin && <TabsTrigger value="activity">User Activity</TabsTrigger>}
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Company Information
              </CardTitle>
              <CardDescription>
                Set up your company details that appear on reports and invoices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    placeholder="Enter company name"
                    value={settings.companyName || ''}
                    onChange={(e) => updateSettings('companyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Company Email</Label>
                  <Input
                    id="companyEmail"
                    type="email"
                    placeholder="company@example.com"
                    value={settings.companyEmail || ''}
                    onChange={(e) => updateSettings('companyEmail', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Company Phone</Label>
                  <Input
                    id="companyPhone"
                    placeholder="+966 12 345 6789"
                    value={settings.companyPhone || ''}
                    onChange={(e) => updateSettings('companyPhone', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select value={settings.timezone} onValueChange={(value) => updateSettings('timezone', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Asia/Riyadh">Asia/Riyadh (Saudi Arabia)</SelectItem>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="companyAddress">Company Address</Label>
                <Textarea
                  id="companyAddress"
                  placeholder="Enter company address"
                  value={settings.companyAddress || ''}
                  onChange={(e) => updateSettings('companyAddress', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Currency Settings */}
        <TabsContent value="currency" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Currency Settings
              </CardTitle>
              <CardDescription>
                Configure how currency values are displayed throughout the system
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currencySymbol">Currency Symbol</Label>
                  <Input
                    id="currencySymbol"
                    placeholder="﷼"
                    value={settings.currencySymbol}
                    onChange={(e) => updateSettings('currencySymbol', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currencyCode">Currency Code</Label>
                  <Input
                    id="currencyCode"
                    placeholder="SAR"
                    value={settings.currencyCode}
                    onChange={(e) => updateSettings('currencyCode', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currencyName">Currency Name</Label>
                  <Input
                    id="currencyName"
                    placeholder="Saudi Riyal"
                    value={settings.currencyName}
                    onChange={(e) => updateSettings('currencyName', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="decimalPlaces">Decimal Places</Label>
                  <Select value={settings.decimalPlaces.toString()} onValueChange={(value) => updateSettings('decimalPlaces', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thousandsSeparator">Thousands Separator</Label>
                  <Input
                    id="thousandsSeparator"
                    placeholder=","
                    value={settings.thousandsSeparator}
                    onChange={(e) => updateSettings('thousandsSeparator', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="decimalSeparator">Decimal Separator</Label>
                  <Input
                    id="decimalSeparator"
                    placeholder="."
                    value={settings.decimalSeparator}
                    onChange={(e) => updateSettings('decimalSeparator', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="symbolPosition">Symbol Position</Label>
                <Select value={settings.symbolPosition} onValueChange={(value: 'before' | 'after') => updateSettings('symbolPosition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="before">Before amount (﷼ 1,000.00)</SelectItem>
                    <SelectItem value="after">After amount (1,000.00 ﷼)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium">Preview:</p>
                <p className="text-lg">
                  {settings.symbolPosition === 'before' 
                    ? `${settings.currencySymbol} 1${settings.thousandsSeparator}234${settings.decimalSeparator}56`
                    : `1${settings.thousandsSeparator}234${settings.decimalSeparator}56 ${settings.currencySymbol}`
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Maintenance Intervals
              </CardTitle>
              <CardDescription>
                Set default maintenance intervals for your fleet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="oilChange">Oil Change Interval (km)</Label>
                  <Input
                    id="oilChange"
                    type="number"
                    placeholder="5000"
                    value={settings.maintenanceIntervals?.oilChange || ''}
                    onChange={(e) => updateNestedSettings('maintenanceIntervals', 'oilChange', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tireRotation">Tire Rotation (km)</Label>
                  <Input
                    id="tireRotation"
                    type="number"
                    placeholder="10000"
                    value={settings.maintenanceIntervals?.tireRotation || ''}
                    onChange={(e) => updateNestedSettings('maintenanceIntervals', 'tireRotation', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="brakeInspection">Brake Inspection (km)</Label>
                  <Input
                    id="brakeInspection"
                    type="number"
                    placeholder="15000"
                    value={settings.maintenanceIntervals?.brakeInspection || ''}
                    onChange={(e) => updateNestedSettings('maintenanceIntervals', 'brakeInspection', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="engineTuneUp">Engine Tune-up (km)</Label>
                  <Input
                    id="engineTuneUp"
                    type="number"
                    placeholder="30000"
                    value={settings.maintenanceIntervals?.engineTuneUp || ''}
                    onChange={(e) => updateNestedSettings('maintenanceIntervals', 'engineTuneUp', parseInt(e.target.value) || 0)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="transmissionService">Transmission Service (km)</Label>
                  <Input
                    id="transmissionService"
                    type="number"
                    placeholder="60000"
                    value={settings.maintenanceIntervals?.transmissionService || ''}
                    onChange={(e) => updateNestedSettings('maintenanceIntervals', 'transmissionService', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure system notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Send notifications via email</p>
                  </div>
                  <Switch
                    checked={settings.notifications?.email || false}
                    onCheckedChange={(checked) => updateNestedSettings('notifications', 'email', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Upcoming Maintenance</Label>
                    <p className="text-sm text-muted-foreground">Alert for upcoming maintenance</p>
                  </div>
                  <Switch
                    checked={settings.notifications?.upcomingMaintenance || false}
                    onCheckedChange={(checked) => updateNestedSettings('notifications', 'upcomingMaintenance', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Overdue Maintenance</Label>
                    <p className="text-sm text-muted-foreground">Alert for overdue maintenance</p>
                  </div>
                  <Switch
                    checked={settings.notifications?.overdueMaintenance || false}
                    onCheckedChange={(checked) => updateNestedSettings('notifications', 'overdueMaintenance', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Low Stock Alerts</Label>
                    <p className="text-sm text-muted-foreground">Alert for low parts inventory</p>
                  </div>
                  <Switch
                    checked={settings.notifications?.lowStock || false}
                    onCheckedChange={(checked) => updateNestedSettings('notifications', 'lowStock', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Role Permissions */}
        {isAdmin && (
          <TabsContent value="roles" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Role Permissions
                </CardTitle>
                <CardDescription>
                  Configure permissions for each user role
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {Object.entries(roleDefinitions).map(([roleKey, roleDef]) => {
                  const Icon = roleDef.icon
                  return (
                    <div key={roleKey} className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 text-${roleDef.color}-500`} />
                        <div>
                          <h3 className="font-semibold">{roleDef.name}</h3>
                          <p className="text-sm text-muted-foreground">{roleDef.description}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'dashboard')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'dashboard', checked)}
                          />
                          <Label className="text-sm">Dashboard Access</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'trucks')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'trucks', checked)}
                          />
                          <Label className="text-sm">Manage Trucks</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'trucks-delete')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'trucks-delete', checked)}
                          />
                          <Label className="text-sm">Delete Trucks</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'maintenance')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'maintenance', checked)}
                          />
                          <Label className="text-sm">Manage Maintenance</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'maintenance-delete')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'maintenance-delete', checked)}
                          />
                          <Label className="text-sm">Delete Maintenance</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'mechanics')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'mechanics', checked)}
                          />
                          <Label className="text-sm">Manage Mechanics</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'mechanics-delete')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'mechanics-delete', checked)}
                          />
                          <Label className="text-sm">Delete Mechanics</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'reports')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'reports', checked)}
                          />
                          <Label className="text-sm">View Reports</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'users')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'users', checked)}
                          />
                          <Label className="text-sm">View Users</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'users-manage')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'users-manage', checked)}
                          />
                          <Label className="text-sm">Manage Users</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'settings')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'settings', checked)}
                          />
                          <Label className="text-sm">View Settings</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'settings-manage')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'settings-manage', checked)}
                          />
                          <Label className="text-sm">Manage Settings</Label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch
                            checked={hasPermission(roleKey, 'admin')}
                            onCheckedChange={(checked) => updateRolePermission(roleKey, 'admin', checked)}
                          />
                          <Label className="text-sm">Admin Access</Label>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* User Activity */}
        {isAdmin && (
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* User Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Recent User Activities
                  </CardTitle>
                  <CardDescription>
                    Latest user actions in the system
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {userActivities.length === 0 ? (
                        <p className="text-center text-muted-foreground">No recent activities</p>
                      ) : (
                        userActivities.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{activity.action}</p>
                              <p className="text-xs text-muted-foreground">
                                {activity.user?.name} - {activity.entityType}
                                {activity.entityName && `: ${activity.entityName}`}
                              </p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Login History */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Login History
                  </CardTitle>
                  <CardDescription>
                    Recent user login sessions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityLoading ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {loginHistory.length === 0 ? (
                        <p className="text-center text-muted-foreground">No login history</p>
                      ) : (
                        loginHistory.map((login) => (
                          <div key={login.id} className="flex items-center justify-between p-2 border rounded">
                            <div className="flex-1">
                              <p className="text-sm font-medium">{login.user?.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {login.ipAddress && `IP: ${login.ipAddress}`}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">
                                {new Date(login.loginTime).toLocaleString()}
                              </p>
                              {login.logoutTime && (
                                <p className="text-xs text-muted-foreground">
                                  Logged out: {new Date(login.logoutTime).toLocaleString()}
                                </p>
                              )}
                              {login.sessionDuration && (
                                <p className="text-xs text-muted-foreground">
                                  Duration: {Math.floor(login.sessionDuration / 60)}m {login.sessionDuration % 60}s
                                </p>
                              )}
                              {login.isActive && (
                                <Badge variant="secondary" className="text-xs">Active</Badge>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}