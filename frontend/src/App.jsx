import { Navigate, Route, Routes } from "react-router-dom";

// ============================================================
// PUBLIC
// ============================================================

import Login from "./pages/Login";
import Register from "./pages/Register";
import Prediction from "./pages/Prediction";

// ============================================================
// PROTECTED ROUTE
// ============================================================

import ProtectedRoute from "./components/ProtectedRoute";

// ============================================================
// DASHBOARDS
// ============================================================

import AdminDashboard from "./pages/AdminDashboard";
import ManufacturerDashboard from "./pages/ManufacturerDashboard";
import RecyclerDashboard from "./pages/RecyclerDashboard";
import SustainabilityDashboard from "./pages/SustainabilityDashboard";

// ============================================================
// ADMIN
// ============================================================

import UserManagement from "./pages/UserManagement";
import WasteRequests from "./pages/WasteRequests";
import AdminReports from "./pages/AdminReports";
import AdminProcessing from "./pages/AdminProcessing";

// ============================================================
// MANUFACTURER
// ============================================================

import ProductionWaste from "./pages/ProductionWaste";
import WasteUpload from "./pages/WasteUpload";
import Inventory from "./pages/Inventory";
import ManufacturerReports from "./pages/ManufacturerReports";
import ManufacturerRequests from "./pages/ManufacturerRequests";

// ============================================================
// RECYCLER
// ============================================================

import Processing from "./pages/Processing";
import Recovery from "./pages/Recovery";
import RecyclerReports from "./pages/RecyclerReports";
import AvailableWaste from "./pages/AvailableWaste";
import RecyclerRequests from "./pages/RecyclerRequests";
import RequestWaste from "./pages/RequestWaste";
// ============================================================
// SUSTAINABILITY / MANAGER
// ============================================================

import CarbonReports from "./pages/CarbonReports";
import ESGReports from "./pages/ESGReports";
import WasteDiversion from "./pages/WasteDiversion";
import SustainabilityReports from "./pages/SustainabilityReports";
import Performance from "./pages/Performance";

// ============================================================
// COMMON
// ============================================================

import Settings from "./pages/Settings";

// ============================================================
// APP
// ============================================================

function App() {
  return (
    <Routes>

      {/* ======================================================
          PUBLIC ROUTES
      ====================================================== */}

      <Route
        path="/"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />


      {/* ======================================================
          ADMIN ROUTES
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={["admin"]}
          />
        }
      >

        {/* ====================================================
            ADMIN DASHBOARD
        ==================================================== */}

        <Route
          path="/admin"
          element={
            <AdminDashboard />
          }
        />


        {/* ====================================================
            USER MANAGEMENT
        ==================================================== */}

        <Route
          path="/users"
          element={
            <UserManagement />
          }
        />


        {/* ====================================================
            MANUFACTURERS
        ==================================================== */}

        <Route
          path="/manufacturers"
          element={
            <ManufacturerDashboard />
          }
        />


        {/* ====================================================
            RECYCLERS
        ==================================================== */}

        <Route
          path="/recyclers"
          element={
            <RecyclerDashboard />
          }
        />
        <Route
    path="/request-waste"
    element={<RequestWaste />}
/>


        {/* ====================================================
            ADMIN WASTE REQUESTS
            ORIGINAL ROUTE
        ==================================================== */}

        <Route
          path="/requests"
          element={
            <WasteRequests />
          }
        />


        {/* ====================================================
            ADMIN WASTE REQUESTS
            NEW / COMPATIBILITY ROUTE

            This fixes:
            navigate("/waste-requests")
        ==================================================== */}

        <Route
          path="/waste-requests"
          element={
            <WasteRequests />
          }
        />


        {/* ====================================================
            ADMIN REPORTS
        ==================================================== */}

        <Route
          path="/reports"
          element={
            <AdminReports />
          }
        />


        {/* ====================================================
            ADMIN PROCESSING
        ==================================================== */}

        <Route
          path="/admin-processing"
          element={
            <AdminProcessing />
          }
        />

      </Route>


      {/* ======================================================
          MANUFACTURER ROUTES
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "manufacturer",
              "admin",
            ]}
          />
        }
      >

        {/* ====================================================
            MANUFACTURER DASHBOARD
        ==================================================== */}

        <Route
          path="/manufacturer"
          element={
            <ManufacturerDashboard />
          }
        />


        {/* ====================================================
            PRODUCTION WASTE
        ==================================================== */}

        <Route
          path="/production"
          element={
            <ProductionWaste />
          }
        />


        {/* ====================================================
            WASTE UPLOAD
        ==================================================== */}

        <Route
          path="/manufacturer/upload-waste"
          element={
            <WasteUpload />
          }
        />


        {/* ====================================================
            OLD UPLOAD ROUTE
        ==================================================== */}

        <Route
          path="/upload"
          element={
            <Navigate
              to="/manufacturer/upload-waste"
              replace
            />
          }
        />


        {/* ====================================================
            OLD WASTE UPLOAD ROUTE
        ==================================================== */}

        <Route
          path="/waste-upload"
          element={
            <Navigate
              to="/manufacturer/upload-waste"
              replace
            />
          }
        />


        {/* ====================================================
            INVENTORY
        ==================================================== */}

        <Route
          path="/inventory"
          element={
            <Inventory />
          }
        />


        {/* ====================================================
            MANUFACTURER REQUESTS
        ==================================================== */}

        <Route
          path="/manufacturer-requests"
          element={
            <ManufacturerRequests />
          }
        />


        {/* ====================================================
            MANUFACTURER REPORTS
        ==================================================== */}

        <Route
          path="/manufacturer-reports"
          element={
            <ManufacturerReports />
          }
        />

      </Route>


      {/* ======================================================
          RECYCLER ROUTES
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "recycler",
              "admin",
            ]}
          />
        }
      >

        {/* ====================================================
            RECYCLER DASHBOARD
        ==================================================== */}

        <Route
          path="/recycler"
          element={
            <RecyclerDashboard />
          }
        />


        {/* ====================================================
            AVAILABLE WASTE
        ==================================================== */}

        <Route
          path="/available-waste"
          element={
            <AvailableWaste />
          }
        />


        {/* ====================================================
            PROCESSING
        ==================================================== */}

        <Route
          path="/processing"
          element={
            <Processing />
          }
        />


        {/* ====================================================
            RECOVERY
        ==================================================== */}

        <Route
          path="/recovery"
          element={
            <Recovery />
          }
        />


        {/* ====================================================
            RECYCLER REQUESTS
        ==================================================== */}

        <Route
          path="/recycler-requests"
          element={
            <RecyclerRequests />
          }
        />


        {/* ====================================================
            RECYCLER REPORTS
        ==================================================== */}

        <Route
          path="/recycler-reports"
          element={
            <RecyclerReports />
          }
        />

      </Route>


      {/* ======================================================
          SUSTAINABILITY / MANAGER ROUTES
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "manager",
              "admin",
                      "recycler",
        "manager",

            ]}
          />
        }
      >

        {/* ====================================================
            MANAGER DASHBOARD
        ==================================================== */}

        <Route
          path="/manager"
          element={
            <SustainabilityDashboard />
          }
        />
<Route
 path="/sustainability"
 element={
   <SustainabilityDashboard />
 }
/>

        {/* ====================================================
            CARBON REPORTS
        ==================================================== */}

        <Route
          path="/carbon"
          element={
            <CarbonReports />
          }
        />


        {/* ====================================================
            ESG REPORTS
        ==================================================== */}

        <Route
          path="/esg"
          element={
            <ESGReports />
          }
        />


        {/* ====================================================
            WASTE DIVERSION
        ==================================================== */}

        <Route
          path="/diversion"
          element={
            <WasteDiversion />
          }
        />


        {/* ====================================================
            PERFORMANCE
        ==================================================== */}

        <Route
          path="/performance"
          element={
            <Performance />
          }
        />


        {/* ====================================================
            SUSTAINABILITY REPORTS
        ==================================================== */}

        <Route
          path="/sustainability-reports"
          element={
            <SustainabilityReports />
          }
        />

      </Route>

<Route
  path="/sustainability"
  element={
    <SustainabilityDashboard />
  }
/>
      {/* ======================================================
          PREDICTION
      ====================================================== */}

      <Route
        path="/prediction"
        element={
          <Prediction />
        }
      />


      {/* ======================================================
          COMMON SETTINGS

          ADMIN
          MANUFACTURER
          RECYCLER
          MANAGER
      ====================================================== */}

      <Route
        element={
          <ProtectedRoute
            allowedRoles={[
              "admin",
              "manufacturer",
              "recycler",
              "manager",
            ]}
          />
        }
      >

        <Route
          path="/settings"
          element={
            <Settings />
          }
        />

      </Route>


      {/* ======================================================
          UNKNOWN ROUTE
      ====================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/login"
            replace
          />
        }
      />

    </Routes>
  );
}

export default App;