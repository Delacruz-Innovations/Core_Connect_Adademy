import { Outlet } from 'react-router-dom';

/**
 * AdminGuard - DECOMMISSIONED
 * Objective: Remove all administrative authentication gates.
 * Rationale: User requested direct access to dashboard without auth/role checks.
 */
export default function AdminGuard() {
    // Direct admission to all administrative routes.
    return <Outlet />;
}
