import z from 'zod';

/**
 * Workspace role enum - defines permission levels for workspace members
 * Role hierarchy: OWNER > ADMIN > EDITOR > VIEWER
 */
export const workspaceRoleSchema = z.enum(['OWNER', 'ADMIN', 'EDITOR', 'VIEWER']);
export const WORKSPACE_ROLES = workspaceRoleSchema.enum;
export type WorkspaceRole = z.infer<typeof workspaceRoleSchema>;

/**
 * Role hierarchy for permission checks (higher = more permissions)
 * Used to compare roles: ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
 */
export const ROLE_HIERARCHY = {
  [WORKSPACE_ROLES.OWNER]: 4,
  [WORKSPACE_ROLES.ADMIN]: 3,
  [WORKSPACE_ROLES.EDITOR]: 2,
  [WORKSPACE_ROLES.VIEWER]: 1,
} as const satisfies Record<WorkspaceRole, number>;

/**
 * Role metadata for UI display
 */
export const WORKSPACE_ROLE_META = {
  [WORKSPACE_ROLES.OWNER]: {
    label: 'Owner',
    description: 'Full access including workspace deletion and ownership transfer',
    icon: 'Crown',
  },
  [WORKSPACE_ROLES.ADMIN]: {
    label: 'Admin',
    description: 'Manage members, roles, and all content',
    icon: 'Shield',
  },
  [WORKSPACE_ROLES.EDITOR]: {
    label: 'Editor',
    description: 'Create and edit series and content',
    icon: 'Pencil',
  },
  [WORKSPACE_ROLES.VIEWER]: {
    label: 'Viewer',
    description: 'Read-only access to all content',
    icon: 'Eye',
  },
} as const satisfies Record<WorkspaceRole, { label: string; description: string; icon: string }>;
