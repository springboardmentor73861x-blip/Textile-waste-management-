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
  const [loading, setLoading] = useState(true);

  const COLORS = [
    "#667eea",
    "#43cea2",
    "#ff9966",
    "#ff6b81",
    "#8e44ad",
    "#f1c40f",
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

      console.log("Monthly Waste:", barRes.data);
      console.log("Waste Types:", pieRes.data);

      setBarData(barRes.data || []);
      setPieData(pieRes.data || []);
    } catch (error) {
      console.error("Chart Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-charts">
        <h3>Loading Charts...</h3>
      </div>
    );
  }

  return (
    <div className="dashboard-charts">

      {/* Monthly Waste */}
      <div className="chart-card">

        <h2>Monthly Waste Collection</h2>

        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar
              dataKey="waste"
              fill="#667eea"
              radius={[10, 10, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>

      </div>

      {/* Waste Types */}
      <div className="chart-card">

        <h2>Waste Type Distribution</h2>

        <ResponsiveContainer width="100%" height={320}>
          <PieChart>

            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={50}
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {pieData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>

            <Tooltip />

            <Legend verticalAlign="bottom" />

          </PieChart>
        </ResponsiveContainer>

      </div>

    </div>
  );
}

export default DashboardCharts;