import { useEffect, useState } from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  getAllWasteRequests,
} from "../services/api";

import "../css/Processing.css";


function Processing() {

  const [collapsed, setCollapsed] = useState(false);

  const [processingRequests, setProcessingRequests] =
    useState([]);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ============================================================
  // FETCH WASTE REQUESTS
  // ============================================================

  const fetchProcessingRequests = async () => {

    try {

      setLoading(true);

      setError("");

      const data =
        await getAllWasteRequests();

      console.log(
        "Waste Requests:",
        data
      );

      setProcessingRequests(
        Array.isArray(data)
          ? data
          : []
      );

    }

    catch (error) {

      console.error(
        "Failed to fetch waste requests:",
        error
      );

      setError(
        error.response?.data?.detail ||
        "Failed to load processing requests."
      );

    }

    finally {

      setLoading(false);

    }

  };


  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {

    fetchProcessingRequests();

  }, []);


  // ============================================================
  // GET PROGRESS
  // ============================================================

  const getProgress = (
    status,
    progress
  ) => {

    // If backend already has progress,
    // use it.

    if (
      progress !== null &&
      progress !== undefined
    ) {

      return Number(progress);

    }


    if (!status) {

      return 0;

    }


    switch (
      status.toLowerCase()
    ) {

      case "completed":

        return 100;


      case "processing":

        return 25;


      case "in progress":

        return 65;


      case "approved":

        return 65;


      case "pending":

        return 0;


      default:

        return 0;

    }

  };


  // ============================================================
  // FILTER DATA
  // ============================================================

  const filteredRequests =
    processingRequests.filter(
      (item) => {

        const material =
          item.material ||
          item.material_type ||
          item.waste_type ||
          "";


        const machine =
          item.machine ||
          "";


        const manufacturer =
          item.manufacturer ||
          "";


        const recycler =
          item.recycler ||
          "";


        const status =
          item.status ||
          "Pending";


        const searchText =
          `${item.id}
           ${material}
           ${machine}
           ${manufacturer}
           ${recycler}
           ${status}`
            .toLowerCase();


        const matchesSearch =
          searchText.includes(
            search.toLowerCase()
          );


        const matchesStatus =
          statusFilter === "All" ||
          status.toLowerCase() ===
          statusFilter.toLowerCase();


        return (
          matchesSearch &&
          matchesStatus
        );

      }
    );


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


        <div className="processing-container">


          <h1>
            Processing Waste
          </h1>


          <p>
            Monitor textile waste requests currently under processing.
          </p>


          {/* ==================================================
              TOOLBAR
          ================================================== */}

          <div className="toolbar">


            <input
              type="text"
              placeholder="Search..."
              className="search-box"
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
            />


            <select
              className="status-filter"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value
                )
              }
            >

              <option value="All">
                All
              </option>

              <option value="Pending">
                Pending
              </option>

              <option value="Processing">
                Processing
              </option>

              <option value="In Progress">
                In Progress
              </option>

              <option value="Approved">
                Approved
              </option>

              <option value="Completed">
                Completed
              </option>

            </select>

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
              TABLE
          ================================================== */}

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Material
                  </th>

                  <th>
                    Quantity
                  </th>

                  <th>
                    Manufacturer
                  </th>

                  <th>
                    Recycler
                  </th>

                  <th>
                    Machine
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Progress
                  </th>

                </tr>

              </thead>


              <tbody>


                {loading ? (

                  <tr>

                    <td
                      colSpan="8"
                      style={{
                        textAlign:
                          "center"
                      }}
                    >

                      Loading processing waste...

                    </td>

                  </tr>

                )


                : filteredRequests.length === 0 ? (

                  <tr>

                    <td
                      colSpan="8"
                      style={{
                        textAlign:
                          "center"
                      }}
                    >

                      No processing waste found.

                    </td>

                  </tr>

                )


                : (

                  filteredRequests.map(
                    (item) => {


                      const status =
                        item.status ||
                        "Pending";


                      const progress =
                        getProgress(
                          status,
                          item.progress
                        );


                      const material =
                        item.material ||
                        item.material_type ||
                        item.waste_type ||
                        "N/A";


                      const machine =
                        item.machine ||
                        "N/A";


                      const manufacturer =
                        item.manufacturer ||
                        "N/A";


                      const recycler =
                        item.recycler ||
                        "N/A";


                      const quantity =
                        item.quantity ??
                        0;


                      const unit =
                        item.unit ||
                        "Kg";


                      return (

                        <tr
                          key={item.id}
                        >


                          <td>
                            {item.id}
                          </td>


                          <td>

                            <strong>
                              {material}
                            </strong>

                          </td>


                          <td>
                            {quantity} {unit}
                          </td>


                          <td>
                            {manufacturer}
                          </td>


                          <td>
                            {recycler}
                          </td>


                          <td>
                            {machine}
                          </td>


                          <td>

                            <span
                              className="processing"
                            >

                              {status}

                            </span>

                          </td>


                          <td>

                            <progress
                              value={
                                progress
                              }
                              max="100"
                            />

                            {" "}

                            {progress}%

                          </td>


                        </tr>

                      );

                    }
                  )

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}


export default Processing;