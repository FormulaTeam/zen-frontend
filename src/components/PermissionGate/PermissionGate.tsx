import React from "react";
import { Permission } from "formula-gear";
import { useSuperAdmin } from "@contexts/SuperAdminContext";


type PermissionGateProps = {
    userPermissions: number[];
    requiredPermissions: Permission[];
    requireAny?: boolean;
    fallback?: React.ReactNode;
    children: React.ReactNode;
};

export const PermissionGate: React.FC<PermissionGateProps> = ({
    userPermissions,
    requiredPermissions,
    requireAny = false,
    fallback = null,
    children,
}) => {
    const { isSuperAdmin } = useSuperAdmin();

    if (isSuperAdmin) {
        return <>{children}</>;
    }

    const safeUserPerms = Array.isArray(userPermissions) ? userPermissions : [];

    const hasPermission = requireAny
        ? requiredPermissions.some((perm) => safeUserPerms.includes(perm))
        : requiredPermissions.every((perm) => safeUserPerms.includes(perm));

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};
