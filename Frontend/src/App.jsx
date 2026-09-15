import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Upload from "./pages/Upload";
import Profile from "./pages/Profile";

import AdminDashboard from "./pages/AdminDashboard";
import UserManagement from "./pages/UserManagement";
import Result from "./pages/Result";
import AdminInventory from "./pages/AdminInventory";
import AdminUploads from "./pages/AdminUploads";
import AdminProfile from "./pages/AdminProfile";

import SustainabilityDashboard from "./pages/SustainabilityDashboard";
import SustainabilityProfile from "./pages/SustainabilityProfile";
import SustainabilityAnalytics from "./pages/SustainabilityAnalytics";
import AnalyzeTextile from "./pages/AnalyzeTextile";
import GenerateReport from "./pages/GenerateReport";
import ManageGoals from "./pages/ManageGoals";
import PredictiveAnalysis from "./pages/PredictiveAnalysis";

import TextileManagerDashboard from "./pages/Textile-manager/TextileManagerDashboard";
import TextileManagerUpload from "./pages/Textile-manager/TextileManagerUpload";
import MaterialClassification from "./pages/Textile-manager/MaterialClassification";
import AIPredictions from "./pages/Textile-manager/AIPredictions";
import Recommendations from "./pages/Textile-manager/Recommendations";
import TextileManagerProfile from "./pages/Textile-manager/TextileManagerProfile";
import RecyclerDashboard from "./pages/RecyclerDashboard";
import RecyclerProfile from "./pages/RecyclerProfile";
import RecyclerRecovery from "./pages/RecyclerRecovery";
import Reports from "./pages/Reports";

import ReportDashboard from "./pages/Report/ReportDashboard";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/profile" element={<Profile />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/result" element={<Result />} />
        <Route path="/admin/inventory" element={<AdminInventory />}/>
        <Route path="/admin/uploads" element={<AdminUploads />}/>
        <Route path="/admin/profile" element={<AdminProfile />}/>
        <Route path="/sustainability-dashboard" element={<SustainabilityDashboard />}/>
        <Route path="/admin/analytics" element={<PredictiveAnalysis />}/>
        <Route path="/sustainability/profile" element={<SustainabilityProfile />}/>
        
        <Route
  path="/sustainability-analytics"
  element={<SustainabilityAnalytics />}
/>
         <Route
  path="/sustainability/analyze-textile"
  element={<AnalyzeTextile />}
/>

<Route
  path="/sustainability/generate-report"
  element={<GenerateReport />}
/>

<Route
  path="/sustainability/manage-goals"
  element={<ManageGoals />}
/>         
        <Route path="/textile-manager-dashboard" element={<TextileManagerDashboard />}/>
        <Route
  path="/textile-manager/upload"
  element={<TextileManagerUpload />}
/>       <Route
  path="/textile-manager/material-classification"
  element={<MaterialClassification />}
/>      
        <Route
  path="/textile-manager/ai-predictions"
  element={<AIPredictions />}
/>
        <Route
  path="/textile-manager/recommendations"
  element={<Recommendations />}
/>
        <Route
  path="/textile-manager/profile"
  element={<TextileManagerProfile />}

/>
        <Route
  path="/recycler/dashboard"
  element={<RecyclerDashboard />}
/>

<Route
  path="/recycler/profile"
  element={<RecyclerProfile />}
/>
<Route
  path="/recycler/recovery"
  element={<RecyclerRecovery />}
/>
        <Route path="/admin/reports" element={<Reports />}/>
        
        <Route path="/report-dashboard" element={<ReportDashboard />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;