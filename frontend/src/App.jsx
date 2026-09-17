import { Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Sustainability from "./pages/Sustainability";
import Analytics from "./pages/Analytics";
import Reports from "./pages/Reports";

function App() {

  return (

    <Routes>

      <Route path="/" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="/inventory" element={<Inventory />} />

      <Route path="/Sustainability" element={<Sustainability />} />
      
      <Route path="/analytics" element={<Analytics />} />

      <Route path="/reports" element={<Reports />} />


    </Routes>

  );

}

export default App;