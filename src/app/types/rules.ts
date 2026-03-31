export type UserRole = 'manager' | 'veterinarian' | 'purchasing' | 'accountant' | 'warehouse'
export type RuleStatus = 'active' | 'disabled'
export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'approve' | 'export'

export interface Rule {
  id: string
  name: string
  module: string
  roles: UserRole[]
  allowedActions: PermissionAction[]
  status: RuleStatus
  lastUpdated: string
}

export interface RuleFormData {
  name: string
  module: string
  roles: UserRole[]
  allowedActions: PermissionAction[]
}

export const EMPTY_FORM: RuleFormData = {
  name: '',
  module: '',
  roles: [],
  allowedActions: [],
}
