// Permission types and utilities

export interface Permission {
  canViewDashboard: boolean
  canViewTrucks: boolean
  canAddTrucks: boolean
  canEditTrucks: boolean
  canDeleteTrucks: boolean
  canViewMaintenance: boolean
  canAddMaintenance: boolean
  canEditMaintenance: boolean
  canDeleteMaintenance: boolean
  canViewMechanics: boolean
  canAddMechanics: boolean
  canEditMechanics: boolean
  canDeleteMechanics: boolean
  canViewReports: boolean
  canViewUsers: boolean
  canManageUsers: boolean
  canViewSettings: boolean
  canManageSettings: boolean
  canViewAdmin: boolean
  canManageAdmin: boolean
}

export interface SettingsPermissions {
  rolePermissions: Record<string, Permission>
  userPermissions: Record<string, Permission>
}

export const defaultPermissions: Permission = {
  canViewDashboard: true,
  canViewTrucks: true,
  canAddTrucks: false,
  canEditTrucks: false,
  canDeleteTrucks: false,
  canViewMaintenance: true,
  canAddMaintenance: false,
  canEditMaintenance: false,
  canDeleteMaintenance: false,
  canViewMechanics: true,
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

export const adminPermissions: Permission = {
  canViewDashboard: true,
  canViewTrucks: true,
  canAddTrucks: true,
  canEditTrucks: true,
  canDeleteTrucks: true,
  canViewMaintenance: true,
  canAddMaintenance: true,
  canEditMaintenance: true,
  canDeleteMaintenance: true,
  canViewMechanics: true,
  canAddMechanics: true,
  canEditMechanics: true,
  canDeleteMechanics: true,
  canViewReports: true,
  canViewUsers: true,
  canManageUsers: true,
  canViewSettings: true,
  canManageSettings: true,
  canViewAdmin: true,
  canManageAdmin: true
}

export const managerPermissions: Permission = {
  canViewDashboard: true,
  canViewTrucks: true,
  canAddTrucks: true,
  canEditTrucks: true,
  canDeleteTrucks: false,
  canViewMaintenance: true,
  canAddMaintenance: true,
  canEditMaintenance: true,
  canDeleteMaintenance: false,
  canViewMechanics: true,
  canAddMechanics: true,
  canEditMechanics: true,
  canDeleteMechanics: false,
  canViewReports: true,
  canViewUsers: true,
  canManageUsers: false,
  canViewSettings: true,
  canManageSettings: false,
  canViewAdmin: false,
  canManageAdmin: false
}

// Structure for settings page - converts permission objects to array format
export const defaultRolePermissions = {
  ADMIN: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'trucks', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'maintenance', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'mechanics', actions: ['read', 'create', 'update', 'delete'] },
    { resource: 'reports', actions: ['read', 'create', 'export'] },
    { resource: 'settings', actions: ['read', 'update'] },
    { resource: 'admin', actions: ['read', 'update'] },
    { resource: 'users', actions: ['read', 'create', 'update', 'delete'] }
  ],
  MANAGER: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'trucks', actions: ['read', 'create', 'update'] },
    { resource: 'maintenance', actions: ['read', 'create', 'update'] },
    { resource: 'mechanics', actions: ['read', 'create', 'update'] },
    { resource: 'reports', actions: ['read', 'create', 'export'] },
    { resource: 'settings', actions: ['read'] },
    { resource: 'users', actions: ['read'] }
  ],
  USER: [
    { resource: 'dashboard', actions: ['read'] },
    { resource: 'trucks', actions: ['read'] },
    { resource: 'maintenance', actions: ['read'] },
    { resource: 'mechanics', actions: ['read'] }
  ]
}

// Export the structure that settings page expects
export const defaultSettingsPermissions = {
  rolePermissions: defaultRolePermissions,
  userPermissions: {}
}

export class PermissionManager {
  private userRole: string
  private userId: string
  private userPermissions: any
  private settingsPermissions: SettingsPermissions | null

  constructor(userRole: string, userId: string, userPermissions?: any) {
    this.userRole = userRole
    this.userId = userId
    this.userPermissions = userPermissions
    this.settingsPermissions = null
  }

  setSettingsPermissions(settingsPermissions: SettingsPermissions) {
    this.settingsPermissions = settingsPermissions
  }

  private getEffectivePermissions(): Permission {
    // First check if user has specific permissions in settings
    if (this.settingsPermissions?.userPermissions?.[this.userId]) {
      return {
        ...this.getRolePermissions(),
        ...this.settingsPermissions.userPermissions[this.userId]
      }
    }

    // Then check if role has custom permissions in settings
    if (this.settingsPermissions?.rolePermissions?.[this.userRole]) {
      return this.settingsPermissions.rolePermissions[this.userRole]
    }

    // Fall back to default role permissions
    return this.getRolePermissions()
  }

  private getRolePermissions(): Permission {
    switch (this.userRole) {
      case 'ADMIN':
        return adminPermissions
      case 'MANAGER':
        return managerPermissions
      default:
        return defaultPermissions
    }
  }

  hasPermission(resource: string, action: string): boolean {
    const permissions = this.getEffectivePermissions()
    
    switch (resource) {
      case 'dashboard':
        return action === 'read' ? permissions.canViewDashboard : false
      case 'trucks':
        switch (action) {
          case 'read': return permissions.canViewTrucks
          case 'create': return permissions.canAddTrucks
          case 'update': return permissions.canEditTrucks
          case 'delete': return permissions.canDeleteTrucks
          default: return false
        }
      case 'maintenance':
        switch (action) {
          case 'read': return permissions.canViewMaintenance
          case 'create': return permissions.canAddMaintenance
          case 'update': return permissions.canEditMaintenance
          case 'delete': return permissions.canDeleteMaintenance
          default: return false
        }
      case 'mechanics':
        switch (action) {
          case 'read': return permissions.canViewMechanics
          case 'create': return permissions.canAddMechanics
          case 'update': return permissions.canEditMechanics
          case 'delete': return permissions.canDeleteMechanics
          default: return false
        }
      case 'reports':
        return action === 'read' ? permissions.canViewReports : false
      case 'users':
        switch (action) {
          case 'read': return permissions.canViewUsers
          case 'create': return permissions.canManageUsers
          case 'update': return permissions.canManageUsers
          case 'delete': return permissions.canManageUsers
          default: return false
        }
      case 'settings':
        switch (action) {
          case 'read': return permissions.canViewSettings
          case 'update': return permissions.canManageSettings
          default: return false
        }
      case 'admin':
        switch (action) {
          case 'read': return permissions.canViewAdmin
          case 'update': return permissions.canManageAdmin
          default: return false
        }
      default:
        return false
    }
  }

  canAccess(resource: string): boolean {
    return this.hasPermission(resource, 'read')
  }

  canCreate(resource: string): boolean {
    return this.hasPermission(resource, 'create')
  }

  canUpdate(resource: string): boolean {
    return this.hasPermission(resource, 'update')
  }

  canDelete(resource: string): boolean {
    return this.hasPermission(resource, 'delete')
  }

  canExport(resource: string): boolean {
    // Export permission is same as read for most resources
    return this.hasPermission(resource, 'read')
  }
}

export function getUserPermissions(userRole: string, userPermissions?: any): Permission {
  // If user has custom permissions, use those
  if (userPermissions && typeof userPermissions === 'object') {
    return {
      ...defaultPermissions,
      ...userPermissions
    }
  }

  // Otherwise, use role-based default permissions
  switch (userRole) {
    case 'ADMIN':
      return adminPermissions
    case 'MANAGER':
      return managerPermissions
    default:
      return defaultPermissions
  }
}

export function hasPermission(permissions: Permission, permission: keyof Permission): boolean {
  return permissions[permission] === true
}

export function canAccessPage(permissions: Permission, page: string): boolean {
  switch (page) {
    case '/':
      return permissions.canViewDashboard
    case '/trucks':
      return permissions.canViewTrucks
    case '/maintenance':
      return permissions.canViewMaintenance
    case '/mechanics':
      return permissions.canViewMechanics
    case '/reports':
      return permissions.canViewReports
    case '/users':
      return permissions.canViewUsers
    case '/settings':
      return permissions.canViewSettings
    case '/admin':
      return permissions.canViewAdmin
    default:
      return false
  }
}