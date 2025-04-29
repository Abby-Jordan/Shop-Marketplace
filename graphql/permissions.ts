import { User } from "@prisma/client";
import { Role as GraphQLRole } from "./graphql-types"

export type AuthUser = User | null | undefined;

export function requireAuth(user: AuthUser) {
  if (!user) throw new Error("Unauthorized");
}

export function requireAdmin(user: AuthUser) {
  requireAuth(user);
  if (user!.role !== GraphQLRole.Admin) throw new Error("Unauthorized");
}

export function canAccessUser(requestingUser: AuthUser, targetUserId: string) {
  requireAuth(requestingUser);
  if (
    requestingUser!.role === GraphQLRole.Admin ||
    requestingUser!.id === targetUserId
  ) {
    return true;
  }
  throw new Error("Unauthorized");
}

export function canAccessOrder(requestingUser: AuthUser, orderUserId: string) {
  requireAuth(requestingUser);
  if (
    requestingUser!.role === GraphQLRole.Admin ||
    requestingUser!.id === orderUserId
  ) {
    return true;
  }
  throw new Error("Not authorized");
}

// Add more permission helpers as needed for other resources 