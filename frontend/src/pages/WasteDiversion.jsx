import { useEffect, useMemo, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  FaRecycle,
  FaTrash,
  FaLeaf,
  FaChartPie,
  FaChartLine,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

import API from "../services/api";

import "../css/WasteDiversion.css";


function WasteDiversion() {

  const [collapsed, setCollapsed] = useState(false);

  const [wasteRequests, setWasteRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================================
  // LOAD WASTE REQUESTS
  // ============================================================

  const loadWasteRequests = async () => {

    try {

      setLoading(true);
      setError("");

      const response = await API.get("/waste-requests/");

      console.log(
        "Waste Diversion Backend Data:",
        response.data
      );

      const data = Array.isArray(response.data)
        ? response.data
        : [];

      setWasteRequests(data);

    } catch (err) {

      console.error(
        "Waste diversion loading failed:",
        err
      );

      setError(
        err.response?.data?.detail ||
        "Unable to load waste diversion data."
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadWasteRequests();

  }, []);


  // ============================================================
  // SAFE NUMBER
  // ============================================================

  const toNumber = (value) => {

    const number = Number(value);

    return Number.isFinite(number)
      ? number
      : 0;

  };


  // ============================================================
  // NORMALIZE STATUS
  // ============================================================

  const normalize = (value) => {

    return String(value || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_-]+/g, "");

  };


  // ============================================================
  // COMPLETED REQUESTS
  // ============================================================

  const completedRequests = useMemo(() => {

    return wasteRequests.filter((item) => {

      const status = normalize(item.status);

      return (
        status === "completed" ||
        status === "recovered" ||
        status === "processed"
      );

    });

  }, [wasteRequests]);


  // ============================================================
  // TOTAL WASTE
  // ============================================================

  const totalWaste = useMemo(() => {

    return completedRequests.reduce(
      (total, item) =>
        total + toNumber(item.quantity),
      0
    );

  }, [completedRequests]);


  // ============================================================
  // CLASSIFY RECOVERY TYPE
  // ============================================================

  const getRecoveryType = (item) => {

    const value = normalize(
      item.recovery_type ||
      item.recoveryType ||
      item.disposal_method ||
      item.disposalMethod ||
      item.recycling_method ||
      item.recyclingMethod ||
      item.recommendation ||
      item.method ||
      item.action
    );


    if (
      value.includes("landfill") ||
      value.includes("dispose")
    ) {
      return "landfill";
    }


    if (
      value.includes("reuse") ||
      value.includes("repurpose")
    ) {
      return "reused";
    }


    if (
      value.includes("recycl")
    ) {
      return "recycled";
    }


    if (
      value.includes("recover")
    ) {
      return "recovered";
    }


    /*
      If backend only sends completed status
      and no recovery type, consider it recovered.
    */

    return "recovered";

  };


  // ============================================================
  // RECYCLED
  // ============================================================

  const recycledWaste = useMemo(() => {

    return completedRequests.reduce(
      (total, item) => {

        return getRecoveryType(item) === "recycled"
          ? total + toNumber(item.quantity)
          : total;

      },
      0
    );

  }, [completedRequests]);


  // ============================================================
  // REUSED
  // ============================================================

  const reusedWaste = useMemo(() => {

    return completedRequests.reduce(
      (total, item) => {

        return getRecoveryType(item) === "reused"
          ? total + toNumber(item.quantity)
          : total;

      },
      0
    );

  }, [completedRequests]);


  // ============================================================
  // RECOVERED
  // ============================================================

  const recoveredWaste = useMemo(() => {

    return completedRequests.reduce(
      (total, item) => {

        return getRecoveryType(item) === "recovered"
          ? total + toNumber(item.quantity)
          : total;

      },
      0
    );

  }, [completedRequests]);


  // ============================================================
  // LANDFILL
  // ============================================================

  const landfillWaste = useMemo(() => {

    return completedRequests.reduce(
      (total, item) => {

        return getRecoveryType(item) === "landfill"
          ? total + toNumber(item.quantity)
          : total;

      },
      0
    );

  }, [completedRequests]);


  // ============================================================
  // DIVERTED WASTE
  // ============================================================

  const divertedWaste = Math.max(
    totalWaste - landfillWaste,
    0
  );


  // ============================================================
  // DIVERSION RATE
  // ============================================================

  const diversionRate =
    totalWaste > 0
      ? (divertedWaste / totalWaste) * 100
      : 0;


  // ============================================================
  // RECOVERY RATE
  // ============================================================

  const recoveryRate =
    totalWaste > 0
      ? (
          (recycledWaste +
            reusedWaste +
            recoveredWaste) /
          totalWaste
        ) * 100
      : 0;


  // ============================================================
  // FORMAT KG
  // ============================================================

  const formatKg = (value) => {

    const number = toNumber(value);

    return Number.isInteger(number)
      ? number.toLocaleString()
      : number.toLocaleString(
          undefined,
          {
            maximumFractionDigits: 1,
          }
        );

  };


  // ============================================================
  // FORMAT %
  // ============================================================

  const formatPercentage = (value) => {

    return `${toNumber(value).toFixed(1)}%`;

  };


  // ============================================================
  // MONTHLY ANALYTICS
  // ============================================================

  const monthlyData = useMemo(() => {

    const months = {};

    completedRequests.forEach((item) => {

      const dateValue =
        item.completed_at ||
        item.completedAt ||
        item.updated_at ||
        item.updatedAt ||
        item.created_at ||
        item.createdAt;

      const date = dateValue
        ? new Date(dateValue)
        : null;


      if (
        !date ||
        Number.isNaN(date.getTime())
      ) {
        return;
      }


      const monthKey =
        `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;


      const monthName =
        date.toLocaleString(
          "en-US",
          {
            month: "long",
          }
        );


      if (!months[monthKey]) {

        months[monthKey] = {

          month: monthName,

          total: 0,

          recycled: 0,

          reused: 0,

          recovered: 0,

          landfill: 0,

        };

      }


      const quantity =
        toNumber(item.quantity);


      const type =
        getRecoveryType(item);


      months[monthKey].total += quantity;


      if (type === "recycled") {

        months[monthKey].recycled += quantity;

      }


      if (type === "reused") {

        months[monthKey].reused += quantity;

      }


      if (type === "recovered") {

        months[monthKey].recovered += quantity;

      }


      if (type === "landfill") {

        months[monthKey].landfill += quantity;

      }

    });


    return Object.entries(months)

      .sort(([a], [b]) =>
        a.localeCompare(b)
      )

      .map(([, data]) => {

        const diverted =
          Math.max(
            data.total -
            data.landfill,
            0
          );


        const diversion =
          data.total > 0
            ? (diverted / data.total) * 100
            : 0;


        return {

          ...data,

          diverted,

          diversion,

        };

      });

  }, [completedRequests]);


  // ============================================================
  // LAST 6 MONTHS
  // ============================================================

  const visibleMonthlyData =
    monthlyData.slice(-6);


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div
      className={
        collapsed
          ? "dashboard sidebar-collapsed"
          : "dashboard"
      }
    >

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      <div
        className={
          `dashboard-content ${
            collapsed
              ? "collapsed"
              : ""
          }`
        }
      >

        <Navbar />


        <main className="waste-diversion-page">


          {/* ====================================================
              HEADER
          ==================================================== */}

          <section className="waste-page-header">

            <div>

              <span className="waste-section-label">
                WASTE MANAGEMENT
              </span>


              <h1>
                Waste Diversion
              </h1>


              <p>
                Monitor textile waste diverted from
                landfill through recycling, reuse and recovery.
              </p>

            </div>

          </section>


          {/* ====================================================
              ERROR
          ==================================================== */}

          {error && (

            <div className="waste-error-message">

              {error}

              <button
                onClick={loadWasteRequests}
              >
                Retry
              </button>

            </div>

          )}


          {/* ====================================================
              LOADING
          ==================================================== */}

          {loading ? (

            <div className="waste-loading">

              <FaSpinner className="spin" />

              <span>
                Loading waste diversion data...
              </span>

            </div>

          ) : (

            <>


              {/* ==================================================
                  KPI CARDS
              ================================================== */}

              <section className="waste-kpi-grid">


                {/* RECYCLED */}

                <div className="waste-kpi-card">

                  <div className="waste-kpi-icon green">

                    <FaRecycle />

                  </div>


                  <div className="waste-kpi-content">

                    <span>
                      WASTE RECYCLED
                    </span>


                    <h2>

                      {formatKg(
                        recycledWaste
                      )}

                      <small>
                        Kg
                      </small>

                    </h2>

                  </div>

                </div>


                {/* LANDFILL */}

                <div className="waste-kpi-card">

                  <div className="waste-kpi-icon red">

                    <FaTrash />

                  </div>


                  <div className="waste-kpi-content">

                    <span>
                      LANDFILL WASTE
                    </span>


                    <h2>

                      {formatKg(
                        landfillWaste
                      )}

                      <small>
                        Kg
                      </small>

                    </h2>

                  </div>

                </div>


                {/* DIVERSION */}

                <div className="waste-kpi-card">

                  <div className="waste-kpi-icon blue">

                    <FaLeaf />

                  </div>


                  <div className="waste-kpi-content">

                    <span>
                      DIVERSION RATE
                    </span>


                    <h2>

                      {formatPercentage(
                        diversionRate
                      )}

                    </h2>

                  </div>

                </div>


                {/* RECOVERY */}

                <div className="waste-kpi-card">

                  <div className="waste-kpi-icon orange">

                    <FaChartPie />

                  </div>


                  <div className="waste-kpi-content">

                    <span>
                      RECOVERY RATE
                    </span>


                    <h2>

                      {formatPercentage(
                        recoveryRate
                      )}

                    </h2>

                  </div>

                </div>


              </section>


              {/* ==================================================
                  PERFORMANCE
              ================================================== */}

              <section className="waste-performance-card">


                <div className="waste-performance-header">

                  <div>

                    <span>
                      DIVERSION PERFORMANCE
                    </span>

                    <h2>
                      Waste Recovery Overview
                    </h2>

                    <p>
                      Current recovered textile waste
                      distribution across recycling,
                      reuse and recovery.
                    </p>

                  </div>


                  <div className="waste-performance-icon">

                    <FaChartLine />

                  </div>

                </div>


                <div className="waste-performance-grid">


                  <div className="performance-stat">

                    <small>
                      TOTAL WASTE
                    </small>

                    <strong>
                      {formatKg(totalWaste)}
                      <em> Kg</em>
                    </strong>

                  </div>


                  <div className="performance-stat">

                    <small>
                      DIVERTED FROM LANDFILL
                    </small>

                    <strong>
                      {formatKg(divertedWaste)}
                      <em> Kg</em>
                    </strong>

                  </div>


                  <div className="performance-stat">

                    <small>
                      REUSED
                    </small>

                    <strong>
                      {formatKg(reusedWaste)}
                      <em> Kg</em>
                    </strong>

                  </div>


                  <div className="performance-stat">

                    <small>
                      RECOVERED
                    </small>

                    <strong>
                      {formatKg(recoveredWaste)}
                      <em> Kg</em>
                    </strong>

                  </div>

                </div>


                <div className="waste-progress-section">

                  <div className="waste-progress-header">

                    <span>
                      Landfill Diversion
                    </span>

                    <strong>
                      {formatPercentage(
                        diversionRate
                      )}
                    </strong>

                  </div>


                  <div className="waste-progress-bar">

                    <div
                      style={{
                        width: `${Math.min(
                          diversionRate,
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </section>


              {/* ==================================================
                  MONTHLY ANALYTICS
              ================================================== */}

              <section className="waste-monthly-card">


                <div className="waste-monthly-header">

                  <div>

                    <span className="monthly-label">
                      MONTHLY ANALYTICS
                    </span>

                    <h2>
                      Monthly Waste Diversion
                    </h2>

                    <p>
                      Monthly overview of recycled,
                      diverted and landfill waste.
                    </p>

                  </div>

                </div>


                {visibleMonthlyData.length === 0 ? (

                  <div className="waste-empty-state">

                    <div className="empty-icon">

                      <FaRecycle />

                    </div>


                    <h3>
                      No completed recovery data
                    </h3>


                    <p>
                      Completed recovery batches
                      will appear here once they
                      are processed.
                    </p>

                  </div>

                ) : (

                  <div className="waste-table-wrapper">

                    <table className="waste-diversion-table">

                      <thead>

                        <tr>

                          <th>
                            MONTH
                          </th>

                          <th>
                            TOTAL WASTE
                          </th>

                          <th>
                            RECYCLED
                          </th>

                          <th>
                            DIVERTED
                          </th>

                          <th>
                            LANDFILL
                          </th>

                          <th>
                            DIVERSION %
                          </th>

                        </tr>

                      </thead>


                      <tbody>

                        {visibleMonthlyData.map(
                          (month, index) => (

                            <tr
                              key={
                                `${month.month}-${index}`
                              }
                            >

                              <td className="month-name">

                                {month.month}

                              </td>


                              <td>

                                {formatKg(
                                  month.total
                                )} Kg

                              </td>


                              <td>

                                {formatKg(
                                  month.recycled
                                )} Kg

                              </td>


                              <td>

                                {formatKg(
                                  month.diverted
                                )} Kg

                              </td>


                              <td>

                                {formatKg(
                                  month.landfill
                                )} Kg

                              </td>


                              <td>

                                <span className="diversion-percentage">

                                  {formatPercentage(
                                    month.diversion
                                  )}

                                </span>

                              </td>

                            </tr>

                          )
                        )}

                      </tbody>

                    </table>

                  </div>

                )}

              </section>


              {/* ==================================================
                  DATA SOURCE
              ================================================== */}

              <div className="waste-live-data">

                <FaCheckCircle />

                <div>

                  <strong>
                    Live Recovery Data
                  </strong>

                  <span>
                    Diversion metrics are calculated
                    from completed textile recovery
                    requests received from the backend.
                  </span>

                </div>

              </div>


            </>

          )}

        </main>

      </div>

    </div>

  );

}


export default WasteDiversion;