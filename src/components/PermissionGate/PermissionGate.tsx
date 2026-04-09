import React from "react";
import { PERMISSION_TYPES } from "@utils/utils";
import { useSuperAdmin } from "@contexts/SuperAdminContext";

type PermissionType = (typeof PERMISSION_TYPES)[keyof typeof PERMISSION_TYPES];

type PermissionGateProps = {
    userPermissions: number[];
    requiredPermissions: PermissionType[];
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
