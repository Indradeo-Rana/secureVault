import { BrowserRouter, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import Vault from "./pages/vault/Vault";
import AddCredential from "./components/AddCredential";
import EditCredential from "./components/EditCredential";
import RecycleCredential from "./components/RecycleCredential";
import PasswordHealth from "./pages/PasswordHealth";
import Dashboard from "./pages/dashboard/Dashboard";
import Trash from "./pages/Trash";
import Settings from "./pages/Settings";
import PasswordGeneratorPage from "./pages/PasswordGeneratorPage";
import ReceivedShares from "./pages/sharing/ReceivedShares";
import SentShares from "./pages/sharing/SentShares";
import Teams from "./pages/team/Teams";
import ViewCredential from "./pages/sharing/ViewCredential";
import TeamDetails from "./pages/team/TeamDetails";
import AddTeamCredential from "./pages/team/AddTeamCredential";
import EditTeamCredential from "./pages/team/EditTeamCredential";
import LoginHistory from "./pages/security/LoginHistory";
import SecurityDashboard from "./pages/security/SecurityDashboard";
import AuditLogs from "./pages/security/AuditLogs";
import PasswordAnalytics from "./pages/security/PasswordAnalytics";
import SecurityReports from "./pages/security/SecurityReports";
import MfaVerification from "./pages/mfa/MfaVerification";
import SecuritySettings from "./pages/SecuritySettings";
import ForgotPassword from "./pages/mfa/ForgotPassword";
import ResetPassword from "./pages/mfa/ResetPassword";
import OAuth2Success from "./pages/OAuth2Sucess";
import Devices from "./pages/Devices";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/mfa-verification" element={<MfaVerification />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/devices" element={<Devices />} />
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/vault"
          element={
            <ProtectedRoute>
              <Vault />
            </ProtectedRoute>
          }
        />
        <Route
          path="/add-credential"
          element={
            <ProtectedRoute>
              <AddCredential />
            </ProtectedRoute>
          }
        />
        <Route
          path="/edit-credential/:id"
          element={
            <ProtectedRoute>
              <EditCredential />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recycle-credential"
          element={
            <ProtectedRoute>
              <RecycleCredential />
            </ProtectedRoute>
          }
        />

        <Route
          path="/password-generator"
          element={
            <ProtectedRoute>
              <PasswordGeneratorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/password-health"
          element={
            <ProtectedRoute>
              <PasswordHealth />
            </ProtectedRoute>
          }
        />

        <Route
          path="/trash"
          element={
            <ProtectedRoute>
              <Trash />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/shared-with-me"
          element={
            <ProtectedRoute>
              <ReceivedShares />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-shares"
          element={
            <ProtectedRoute>
              <SentShares />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams"
          element={
            <ProtectedRoute>
              <Teams />
            </ProtectedRoute>
          }
        />
        <Route
          path="/teams/:teamId"
          element={
            <ProtectedRoute>
              <TeamDetails />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/:teamId/add-credential"
          element={
            <ProtectedRoute>
              <AddTeamCredential />
            </ProtectedRoute>
          }
        />

        <Route
          path="/teams/:teamId/edit-credential/:teamCredentialId"
          element={
            <ProtectedRoute>
              <EditTeamCredential />
            </ProtectedRoute>
          }
        />

        <Route
          path="/credential/:id"
          element={
            <ProtectedRoute>
              <ViewCredential />
            </ProtectedRoute>
          }
        />

        <Route
          path="/login-history"
          element={
            <ProtectedRoute>
              <LoginHistory />
            </ProtectedRoute>
          }
        />
        <Route
          path="/security"
          element={
            <ProtectedRoute>
              <SecurityDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <AuditLogs />
            </ProtectedRoute>
          }
        />

        <Route
          path="/security/password-analytics"
          element={
            <ProtectedRoute>
              <PasswordAnalytics />
            </ProtectedRoute>
          }
        />

        <Route
          path="/security/reports"
          element={
            <ProtectedRoute>
              <SecurityReports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/security-settings"
          element={
            <ProtectedRoute>
              <SecuritySettings />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/notifications"
          element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
