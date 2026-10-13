
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import API_BASE_URL from "../config/api";
import {
  BarChart3,
  ClipboardList,
  Handshake,
  Home,
  KeyRound,
  LockKeyhole,
  LogOut,
  MonitorSmartphone,
  Send,
  Settings,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
} from "lucide-react";

function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const token = localStorage.getItem("token");

    try {
      // Revoke token on backend
      if (token) {
        await fetch(`${API_BASE_URL}/api/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      // Clear local authentication data
      localStorage.removeItem("token");
      localStorage.removeItem("username");
      localStorage.removeItem("email");

      // Redirect to login
      navigate("/login");
    }
  };

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition ${
      isActive
        ? "bg-blue-600 text-white"
        : "text-slate-300 hover:bg-slate-800 hover:text-white"
    }`;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-20 flex-col bg-slate-900 text-white lg:w-64">
      
      {/* Logo */}
      <div className="flex-shrink-0 border-b border-slate-700 px-3 py-6 lg:px-6">
        <div className="flex items-center justify-center gap-3 lg:justify-start">
          <LockKeyhole size={28} aria-hidden="true" />

          <div className="hidden lg:block">
            <h1 className="text-xl font-bold">SecureVault</h1>

            <p className="text-xs text-slate-400">
              Password Manager
            </p>
          </div>
        </div>
      </div>

      {/* Navigation - Scrollable */}
      <nav className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-2 py-6 lg:px-4">
        
        {/* Main */}
        <p className="mb-3 hidden px-4 text-xs uppercase text-slate-500 lg:block">
          Main
        </p>

        <NavLink to="/dashboard" title="Dashboard" className={linkClass}>
          <Home size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Dashboard</span>
        </NavLink>

        <NavLink to="/vault" title="My Vault" className={linkClass}>
          <KeyRound size={19} aria-hidden="true" />
          <span className="hidden lg:inline">My Vault</span>
        </NavLink>

        {/* <NavLink to="/password-generator" className={linkClass}>
          Password Generator
        </NavLink> */}

        <NavLink to="/shared-with-me" title="Shared With Me" className={linkClass}>
          <Handshake size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Shared With Me</span>
        </NavLink>

        <NavLink to="/my-shares" title="My Shares" className={linkClass}>
          <Send size={19} aria-hidden="true" />
          <span className="hidden lg:inline">My Shares</span>
        </NavLink>

        <NavLink to="/teams" title="Teams Vault" className={linkClass}>
          <Users size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Teams Vault</span>
        </NavLink>

        {/* Manage */}
        <p className="mb-3 mt-8 hidden px-4 text-xs uppercase text-slate-500 lg:block">
          Manage
        </p>

        <NavLink to="/security-settings" title="MFA Settings" className={linkClass}>
          <ShieldCheck size={19} aria-hidden="true" />
          <span className="hidden lg:inline">MFA Settings</span>
        </NavLink>

        <NavLink to="/devices" title="Device Management" className={linkClass}>
          <MonitorSmartphone size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Device Management</span>
        </NavLink>

        <NavLink to="/trash" title="Trash" className={linkClass}>
          <Trash2 size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Trash</span>
        </NavLink>

        {/* System */}
        <p className="mb-3 mt-8 hidden px-4 text-xs uppercase text-slate-500 lg:block">
          System
        </p>

        <NavLink to="/security" title="Security Dashboard" className={linkClass}>
          <ShieldCheck size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Security Dashboard</span>
        </NavLink>

        <NavLink to="/login-history" title="Login History" className={linkClass}>
          <LockKeyhole size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Login History</span>
        </NavLink>

        <NavLink to="/audit-logs" title="Audit Logs" className={linkClass}>
          <ClipboardList size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Audit Logs</span>
        </NavLink>

        <NavLink
          to="/security/password-analytics"
          title="Password Analytics"
          className={linkClass}
        >
          <BarChart3 size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Password Analytics</span>
        </NavLink>

        <NavLink to="/security/reports" title="Security Reports" className={linkClass}>
          <TrendingUp size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Security Reports</span>
        </NavLink>

        <NavLink to="/settings" title="Settings" className={linkClass}>
          <Settings size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Settings</span>
        </NavLink>
      </nav>

      {/* Logout - Always visible */}
      <div className="flex-shrink-0 border-t border-slate-700 p-2 lg:p-4">
        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-3 rounded-lg px-3 py-3 text-slate-300 transition hover:bg-red-600 hover:text-white lg:justify-start lg:px-4"
        >
          <LogOut size={19} aria-hidden="true" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
