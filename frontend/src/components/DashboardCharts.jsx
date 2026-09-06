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


  // ============================================================
  // FETCH MANUFACTURER WASTE DATA
  // ============================================================

  useEffect(() => {

    fetchCharts();

  }, []);


  const fetchCharts = async () => {

    try {

      setLoading(true);


      // --------------------------------------------------------
      // GET WASTE FROM BACKEND
      // --------------------------------------------------------

      const response = await API.get("/waste/");

      console.log(
        "Manufacturer Chart Waste:",
        response.data
      );


      // --------------------------------------------------------
      // HANDLE API RESPONSE
      // --------------------------------------------------------

      let wasteList = [];


      if (Array.isArray(response.data)) {

        wasteList = response.data;

      } else if (
        Array.isArray(response.data?.items)
      ) {

        wasteList = response.data.items;

      } else if (
        Array.isArray(response.data?.data)
      ) {

        wasteList = response.data.data;

      }


      // --------------------------------------------------------
      // MONTHLY WASTE
      // --------------------------------------------------------

      const monthly = {};


      wasteList.forEach((item) => {

        const quantity = Number(
          item.quantity ??
          item.weight ??
          0
        );


        // Try created_at first
        const dateValue =
          item.created_at ??
          item.createdAt ??
          item.date;


        let month = "Unknown";


        if (dateValue) {

          const date = new Date(dateValue);


          if (!isNaN(date.getTime())) {

            month = date.toLocaleString(
              "default",
              {
                month: "short",
              }
            );

          }

        }


        if (!monthly[month]) {

          monthly[month] = 0;

        }


        monthly[month] += quantity;

      });


      const monthlyWaste = Object.entries(
        monthly
      ).map(([month, waste]) => ({

        month,

        waste,

      }));


      // --------------------------------------------------------
      // WASTE TYPE DISTRIBUTION
      // --------------------------------------------------------

      const typeTotals = {};


      wasteList.forEach((item) => {

        const type =
          item.waste_type ??
          item.waste_category ??
          item.material ??
          "Unknown";


        const quantity = Number(
          item.quantity ??
          item.weight ??
          0
        );


        if (!typeTotals[type]) {

          typeTotals[type] = 0;

        }


        typeTotals[type] += quantity;

      });


      const wasteTypes = Object.entries(
        typeTotals
      ).map(([name, value]) => ({

        name,

        value,

      }));


      console.log(
        "Monthly Waste:",
        monthlyWaste
      );

      console.log(
        "Waste Types:",
        wasteTypes
      );


      setBarData(monthlyWaste);

      setPieData(wasteTypes);


    } catch (error) {

      console.error(
        "Manufacturer Chart Error:",
        error
      );

      setBarData([]);

      setPieData([]);

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {

    return (

      <div className="dashboard-charts">

        <h3>
          Loading Charts...
        </h3>

      </div>

    );

  }


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="dashboard-charts">


      {/* ======================================================
          MONTHLY WASTE
      ====================================================== */}

      <div className="chart-card">

        <h2>
          Monthly Waste Collection
        </h2>


        {barData.length === 0 ? (

          <div
            style={{
              height: "320px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >

            No waste data available.

          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <BarChart data={barData}>

              <CartesianGrid
                strokeDasharray="3 3"
              />

              <XAxis
                dataKey="month"
              />

              <YAxis />

              <Tooltip />

              <Legend />

              <Bar
                dataKey="waste"
                fill="#667eea"
                radius={[
                  10,
                  10,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        )}

      </div>


      {/* ======================================================
          WASTE TYPES
      ====================================================== */}

      <div className="chart-card">

        <h2>
          Waste Type Distribution
        </h2>


        {pieData.length === 0 ? (

          <div
            style={{
              height: "320px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >

            No waste type data available.

          </div>

        ) : (

          <ResponsiveContainer
            width="100%"
            height={320}
          >

            <PieChart>

              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={110}
                innerRadius={50}
                label={({
                  name,
                  percent,
                }) =>
                  `${name} ${(
                    percent * 100
                  ).toFixed(0)}%`
                }
              >

                {pieData.map(
                  (entry, index) => (

                    <Cell
                      key={`cell-${index}`}
                      fill={
                        COLORS[
                          index %
                          COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Pie>

              <Tooltip />

              <Legend
                verticalAlign="bottom"
              />

            </PieChart>

          </ResponsiveContainer>

        )}

      </div>

    </div>

  );

}


export default DashboardCharts;