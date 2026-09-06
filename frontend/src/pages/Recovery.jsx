import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import API from "../services/api";

import {
  FaRecycle,
  FaLeaf,
  FaBoxes,
  FaCheckCircle,
  FaSearch,
  FaChartLine,
} from "react-icons/fa";

import "../css/Recovery.css";


function Recovery() {

  // ============================================================
  // SIDEBAR
  // ============================================================

  const [collapsed, setCollapsed] = useState(false);


  // ============================================================
  // DATA
  // ============================================================

  const [recoveryData, setRecoveryData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================================
  // SEARCH / FILTER
  // ============================================================

  const [search, setSearch] = useState("");

  const [filter, setFilter] = useState("All");


  // ============================================================
  // FETCH COMPLETED REQUESTS
  // ============================================================

  const fetchRecoveryData = async () => {

    try {

      setLoading(true);

      setError("");

      const response = await API.get(
        "/waste-requests/"
      );

      console.log(
        "All Waste Requests:",
        response.data
      );


      const requests =
        Array.isArray(response.data)
          ? response.data
          : [];


      // ========================================================
      // ONLY COMPLETED REQUESTS
      // ========================================================

      const completedRequests =
        requests.filter((item) => {

          const status =
            String(
              item.status || ""
            )
              .trim()
              .toLowerCase();


          return status === "completed";

        });


      console.log(
        "Completed Recovery Requests:",
        completedRequests
      );


      setRecoveryData(
        completedRequests
      );

    } catch (error) {

      console.error(
        "Failed to load recovery data:",
        error
      );


      setError(
        error.response?.data?.detail ||
        "Failed to load recovered materials."
      );

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // LOAD
  // ============================================================

  useEffect(() => {

    fetchRecoveryData();

  }, []);


  // ============================================================
  // CALCULATE RECOVERY RATE
  // ============================================================

  const getRecoveryRate = (item) => {

    /*
      If backend later provides recovery_rate,
      use that value.

      Otherwise completed processing
      is treated as 100%.
    */

    if (
      item.recovery_rate !== undefined &&
      item.recovery_rate !== null
    ) {

      return Number(
        item.recovery_rate
      );

    }


    if (
      item.recovery !== undefined &&
      item.recovery !== null
    ) {

      return Number(
        String(item.recovery)
          .replace("%", "")
      );

    }


    return 100;

  };


  // ============================================================
  // FILTER DATA
  // ============================================================

  const filteredData =
    recoveryData.filter((item) => {

      const material =
        item.material ||
        item.material_type ||
        item.waste_type ||
        "";


      const id =
        item.id ||
        "";


      const status =
        item.status ||
        "Completed";


      const searchText =
        `${id} ${material} ${status}`
          .toLowerCase();


      const searchMatch =
        searchText.includes(
          search.toLowerCase()
        );


      const statusMatch =
        filter === "All" ||
        status.toLowerCase() ===
          filter.toLowerCase();


      return (
        searchMatch &&
        statusMatch
      );

    });


  // ============================================================
  // STATISTICS
  // ============================================================

  const totalRecovered =
    recoveryData.reduce(
      (total, item) => {

        return (
          total +
          Number(
            item.quantity || 0
          )
        );

      },
      0
    );


  const completedJobs =
    recoveryData.length;


  const averageRecoveryRate =
    recoveryData.length > 0
      ? Math.round(
          recoveryData.reduce(
            (total, item) => {

              return (
                total +
                getRecoveryRate(item)
              );

            },
            0
          ) /
          recoveryData.length
        )
      : 0;


  const recoveredBatches =
    recoveryData.length;


  // ============================================================
  // UI
  // ============================================================

  return (

    <div className="dashboard">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <div
        className={`dashboard-content ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >

        <Navbar />


        <div className="recovery-container">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="recovery-header">

            <div>

              <h1>
                Recovered Materials
              </h1>

              <p>
                Track completed textile waste processing
                and recovered materials.
              </p>

            </div>


            <div className="recovery-header-icon">

              <FaRecycle />

            </div>

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="error-message">

              {error}

            </div>

          )}


          {/* ==================================================
              SUMMARY CARDS
          ================================================== */}

          <div className="recovery-cards">


            {/* TOTAL RECOVERED */}

            <div className="recovery-card green">

              <div className="card-icon">

                <FaRecycle />

              </div>


              <div>

                <span>
                  Total Recovered
                </span>

                <h2>
                  {totalRecovered} Kg
                </h2>

              </div>

            </div>


            {/* RECOVERY RATE */}

            <div className="recovery-card blue">

              <div className="card-icon">

                <FaLeaf />

              </div>


              <div>

                <span>
                  Recovery Rate
                </span>

                <h2>
                  {averageRecoveryRate}%
                </h2>

              </div>

            </div>


            {/* BATCHES */}

            <div className="recovery-card orange">

              <div className="card-icon">

                <FaBoxes />

              </div>


              <div>

                <span>
                  Recovered Batches
                </span>

                <h2>
                  {recoveredBatches}
                </h2>

              </div>

            </div>


            {/* COMPLETED */}

            <div className="recovery-card purple">

              <div className="card-icon">

                <FaCheckCircle />

              </div>


              <div>

                <span>
                  Completed Jobs
                </span>

                <h2>
                  {completedJobs}
                </h2>

              </div>

            </div>


          </div>


          {/* ==================================================
              TOOLBAR
          ================================================== */}

          <div className="recovery-toolbar">


            <div className="recovery-search">

              <FaSearch />

              <input
                type="text"
                placeholder="Search material or batch..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>


            <select
              value={filter}
              onChange={(e) =>
                setFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All Status
              </option>

              <option value="Completed">
                Completed
              </option>

            </select>


          </div>


          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    Batch ID
                  </th>

                  <th>
                    Material
                  </th>

                  <th>
                    Recovered Quantity
                  </th>

                  <th>
                    Recovery Rate
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Performance
                  </th>

                </tr>

              </thead>


              <tbody>


                {/* LOADING */}

                {loading && (

                  <tr>

                    <td
                      colSpan="6"
                      style={{
                        textAlign: "center",
                        padding: "30px",
                      }}
                    >

                      Loading recovered materials...

                    </td>

                  </tr>

                )}


                {/* EMPTY */}

                {!loading &&
                  filteredData.length === 0 && (

                    <tr>

                      <td
                        colSpan="6"
                        style={{
                          textAlign: "center",
                          padding: "30px",
                        }}
                      >

                        No completed processing found.

                      </td>

                    </tr>

                  )}


                {/* DATA */}

                {!loading &&
                  filteredData.map(
                    (item) => {


                      const material =
                        item.material ||
                        item.material_type ||
                        item.waste_type ||
                        "N/A";


                      const quantity =
                        item.quantity ?? 0;


                      const unit =
                        item.unit ||
                        "Kg";


                      const recoveryRate =
                        getRecoveryRate(item);


                      const status =
                        item.status ||
                        "Completed";


                      return (

                        <tr
                          key={item.id}
                        >


                          {/* BATCH ID */}

                          <td>

                            <strong>
                              RW-{item.id}
                            </strong>

                          </td>


                          {/* MATERIAL */}

                          <td>

                            <div className="material-cell">

                              <FaRecycle />

                              {material}

                            </div>

                          </td>


                          {/* QUANTITY */}

                          <td>

                            {quantity} {unit}

                          </td>


                          {/* RECOVERY RATE */}

                          <td>

                            <span className="rate">

                              {recoveryRate}%

                            </span>

                          </td>


                          {/* STATUS */}

                          <td>

                            <span
                              className={
                                `recovery-status ${
                                  status
                                    .toLowerCase()
                                    .replace(
                                      /\s+/g,
                                      "-"
                                    )
                                }`
                              }
                            >

                              {status}

                            </span>

                          </td>


                          {/* PERFORMANCE */}

                          <td>

                            <div className="performance">

                              <FaChartLine />

                              {recoveryRate >= 80
                                ? "Good"
                                : recoveryRate >= 50
                                ? "Average"
                                : "Low"}

                            </div>

                          </td>


                        </tr>

                      );

                    }
                  )}

              </tbody>

            </table>

          </div>


        </div>

      </div>

    </div>

  );

}


export default Recovery;