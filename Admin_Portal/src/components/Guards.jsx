import React from 'react';
import { Outlet } from 'react-router-dom';

// MOCK GUARDS - ALWAYS ALLOW ACCESS
export const AuthGuard = () => <Outlet />;
export const VerifiedGuard = () => <Outlet />;
export const AdminGuard = () => <Outlet />;
