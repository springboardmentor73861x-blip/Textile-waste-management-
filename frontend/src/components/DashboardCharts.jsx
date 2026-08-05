import { useEffect, useState } from "react";
import API from "../services/api";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import "../css/DashboardCharts.css";

function DashboardCharts() {

  const [barData, setBarData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  const COLORS = [
    "#667eea",
    "#43cea2",
    "#ff9966",
    "#ff6b81",
  ];

  useEffect(() => {
    fetchCharts();
  }, []);

  const fetchCharts = async () => {
  try {
    const [barRes, pieRes] = await Promise.all([
      API.get("/admin/monthly-waste"),
      API.get("/admin/waste-types"),
    ]);

    setBarData(barRes.data);
    setPieData(pieRes.data);

  } catch (error) {
    console.error(error);
  }
};

  useEffect(() => {
    const updateTheme = () => {
      setDarkMode(document.body.classList.contains("dark-theme"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const textColor = darkMode ? "#ffffff" : "#444";
  const gridColor = darkMode ? "#555" : "#d9d9d9";

  const tooltipStyle = {
    backgroundColor: darkMode ? "#2d2d2d" : "#ffffff",
    color: darkMode ? "#ffffff" : "#333333",
    border: "none",
    borderRadius: "10px",
  };

  return (
    <div className="charts-container">

      {/* Pie Chart */}

      <div className="chart-card">

        <h2>User Distribution</h2>

        <ResponsiveContainer width="100%" height={250}>

          <PieChart>

            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >

              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}

            </Pie>

            <Tooltip contentStyle={tooltipStyle} />

            <Legend
              wrapperStyle={{
                color: textColor,
              }}
            />

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* Bar Chart */}

      <div className="chart-card">

        <h2>Waste Analytics</h2>

        <ResponsiveContainer width="100%" height={250}>

          <BarChart data={barData}>

  <CartesianGrid strokeDasharray="3 3" />

  <XAxis dataKey="month" />

  <YAxis />

  <Tooltip />

  <Legend />

  <Bar
    dataKey="waste"
    fill="#667eea"
    radius={[8, 8, 0, 0]}
  />

</BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default DashboardCharts;