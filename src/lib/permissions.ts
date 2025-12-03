/**
 * Role hierarchy for cascading permissions
 * Higher roles can access dashboards of lower roles
 */
const roleHierarchy = {
  admin: 5,        // Universal admin - access to everything
  tenant_admin: 4, // Tenant admin - access to manager, chef, waiter
  manager: 3,      // Manager - access to chef, waiter (NOT tenant_admin)
  chef: 2,         // Chef - access to waiter
  waiter: 1,       // Waiter - access to own dashboard only
  cook: 2,         // Cook - same level as chef
} as const;

export type AppRole = keyof typeof roleHierarchy;

/**
 * Check if a user's role has permission to access a required role's dashboard
 * Uses cascading hierarchy where higher roles inherit lower role permissions
 * 
 * @param userRole - The role of the user trying to access
 * @param requiredRole - The minimum role required for the dashboard
 * @returns true if user has permission, false otherwise
 */
export function checkPermission(userRole: AppRole, requiredRole: AppRole): boolean {
  const userLevel = roleHierarchy[userRole];
  const requiredLevel = roleHierarchy[requiredRole];
  
  // Universal admin bypasses all checks
  if (userRole === 'admin') {
    return true;
  }
  
  // User must have equal or higher level than required
  return userLevel >= requiredLevel;
}

/**
 * Check if any of the user's roles grant access to the required role
 * 
 * @param userRoles - Array of roles the user has
 * @param allowedRoles - Array of roles that are allowed to access
 * @returns true if user has permission, false otherwise
 */
export function hasAnyPermission(
  userRoles: AppRole[],
  allowedRoles: AppRole[]
): boolean {
  return userRoles.some(userRole =>
    allowedRoles.some(allowedRole =>
      checkPermission(userRole, allowedRole)
    )
  );
}
