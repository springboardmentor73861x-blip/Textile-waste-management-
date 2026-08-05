import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import RecyclerDashboard from "./pages/RecyclerDashboard";
import SustainabilityDashboard from "./pages/SustainabilityDashboard";

import UserManagement from "./pages/UserManagement";
import ProductionWaste from "./pages/ProductionWaste";
import WasteUpload from "./pages/WasteUpload";
import Inventory from "./pages/Inventory";
import ManufacturerReports from "./pages/ManufacturerReports";

import ReceivedWaste from "./pages/ReceivedWaste";
import Processing from "./pages/Processing";
import Recovery from "./pages/Recovery";
import RecyclerReports from "./pages/RecyclerReports";

import CarbonReports from "./pages/CarbonReports";
import ESGReports from "./pages/ESGReports";
import WasteDiversion from "./pages/WasteDiversion";
import SustainabilityReports from "./pages/SustainabilityReports";

function App() {
  return (
    <Routes>

      {/* Authentication */}

      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Dashboards */}

      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/manufacturer" element={<ManufacturerDashboard />} />
      <Route path="/recycler" element={<RecyclerDashboard />} />
      <Route path="/manager" element={<SustainabilityDashboard />} />

      {/* Admin */}

      <Route path="/users" element={<UserManagement />} />

      {/* Manufacturer */}

      <Route path="/production" element={<ProductionWaste />} />
      <Route path="/upload" element={<WasteUpload />} />
      <Route path="/inventory" element={<Inventory />} />
      <Route path="/manufacturer-reports" element={<ManufacturerReports />} />

      {/* Recycler */}

      <Route path="/received" element={<ReceivedWaste />} />
      <Route path="/processing" element={<Processing />} />
      <Route path="/recovery" element={<Recovery />} />
      <Route path="/recycler-reports" element={<RecyclerReports />} />

      {/* Sustainability */}

      <Route path="/carbon" element={<CarbonReports />} />
      <Route path="/esg" element={<ESGReports />} />
      <Route path="/diversion" element={<WasteDiversion />} />
      <Route
        path="/sustainability-reports"
        element={<SustainabilityReports />}
      />

    </Routes>
  );
}

export default App;