import { Routes, Route } from "react-router-dom";

import AppLayout from "./components/AppLayout";
import Reports from "./pages/Reports";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import History from "./pages/History";
import HistoryDetails from "./pages/HistoryDetails";
import Analytics from "./pages/Analytics";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      {/* Pages WITHOUT Sidebar/Navbar */}
      <Route path="/" element={<Login />} />

      <Route
        path="/admin-dashboard"
        element={
          <AppLayout>
            <AdminDashboard />
          </AppLayout>
        }
      />

      <Route
        path="/register"
        element={<Register />}
      />

      {/* Pages WITH App Layout */}

      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <Dashboard />
          </AppLayout>
        }
      />

      <Route
        path="/upload"
        element={
          <AppLayout>
            <Upload />
          </AppLayout>
        }
      />

      <Route
        path="/history"
        element={
          <AppLayout>
            <History />
          </AppLayout>
        }
      />

      <Route
        path="/analytics"
        element={
          <AppLayout>
            <Analytics />
          </AppLayout>
        }
      />

      <Route
        path="/history/:id"
        element={
          <AppLayout>
            <HistoryDetails />
          </AppLayout>
        }
      />

      <Route
        path="/reports"
        element={
          <AppLayout>
            <Reports />
          </AppLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <AppLayout>
            <Profile />
          </AppLayout>
        }
      />
    </Routes>
  );
}

export default App;