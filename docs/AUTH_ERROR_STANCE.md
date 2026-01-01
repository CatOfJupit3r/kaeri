# Authentication & Error Handling Stance

This document outlines the security and error handling conventions for the Kaeri platform.

## Authentication Approach

### Better Auth Integration

The Kaeri platform uses [Better Auth](https://www.better-auth.com/) for authentication:

- **Session Management**: Secure, HTTP-only cookies
- **Cookie Settings**: `sameSite: 'none'`, `secure: true` for cross-origin support
- **Context Integration**: Session automatically injected into oRPC context via `createContext`

All protected endpoints require authentication and receive `context.session`.

### Protected Procedures

Use `protectedProcedure` from `@~/lib/orpc` for authenticated endpoints. The procedure automatically validates sessions and injects user context.

## Error Handling Stance: NOT_FOUND vs FORBIDDEN

### The NOT_FOUND Security Pattern

**Rule**: Use `NOT_FOUND` to hide the existence of resources the user cannot access.

**Rationale**: 
- Prevents information disclosure about what resources exist
- Consistent security model across all features
- Future-proof for multi-tenancy

### When to Use NOT_FOUND

1. **Resource doesn't exist**
2. **User has NO access** to the resource (even if it exists)
3. **Private/hidden resources** without proper permissions

### When to Use FORBIDDEN

1. **User has SOME access** but insufficient permissions for the action
2. **Permission-based restrictions** within accessible resources

## Error Code Conventions

All error codes are defined in `packages/shared/src/enums/errors.enums.ts` and must be used with error wrappers from `@~/lib/orpc-error-wrapper`:

```typescript
import {
  ORPCUnauthorizedError,      // 401 - No authentication
  ORPCForbiddenError,          // 403 - Insufficient permissions
  ORPCNotFoundError,           // 404 - Not found or no access
  ORPCBadRequestError,         // 400 - Invalid input
  ORPCUnprocessableContentError, // 422 - Valid but semantically invalid
  ORPCInternalServerError,     // 500 - Server error
} from '@~/lib/orpc-error-wrapper';
```

## Common Patterns

### Resource Access Check
```typescript
const resource = await ResourceModel.findById(resourceId);
if (!resource || !canUserAccess(resource, userId)) {
  throw ORPCNotFoundError(errorCodes.RESOURCE_NOT_FOUND);
}
```

### Mutation with Permission Check
```typescript
const resource = await ResourceModel.findById(resourceId);
if (!resource || !canUserAccess(resource, userId)) {
  throw ORPCNotFoundError(errorCodes.RESOURCE_NOT_FOUND);
}
if (!canUserEdit(resource, userId)) {
  throw ORPCForbiddenError(errorCodes.INSUFFICIENT_PERMISSIONS);
}
```

## Benefits

1. **Security**: Prevents enumeration attacks
2. **Consistency**: Same pattern across features
3. **Future-Proof**: Ready for multi-user scenarios
4. **Privacy**: Doesn't leak resource existence information
