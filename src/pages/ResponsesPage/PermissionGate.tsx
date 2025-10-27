import React from "react";
// import { useMyTablePerms } from "./useTablePermissions"/;
import { LegacyPermission, makePermSet } from "../../utils/utils";
// import { LegacyPermission } from "";

type PermissionGateProps = {
  userPermissions: LegacyPermission[];
  permissions: LegacyPermission[];
  fallback?: React.ReactNode;
  disableInsteadOfHide?: boolean;
  children: React.ReactNode;
};

export function PermissionGate({
  permissions,
  userPermissions,
  fallback = null,
  disableInsteadOfHide = false,
  children,
}: PermissionGateProps) {
  const permsSet = makePermSet(userPermissions);

  const allowed = permsSet ? permissions.every((permission) => permsSet.has(permission)) : false;

  if (allowed) return <>{children}</>;

  if (disableInsteadOfHide) {
    return (
      <div
        aria-disabled
        style={{ opacity: 0.5, pointerEvents: "none" }}
        title="You don't have permission">
        {children}
      </div>
    );
  }

  return <>{fallback}</>;
}
