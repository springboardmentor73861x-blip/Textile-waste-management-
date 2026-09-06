import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  getAllWaste,
  getAllWasteRequests,
  createWasteRequest,
} from "../services/api";

import {
  FaClipboardCheck,
  FaRecycle,
  FaSearch,
  FaSyncAlt,
  FaPaperPlane,
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
} from "react-icons/fa";

import "../css/RecyclerRequests.css";


function RecyclerRequests() {

  // ============================================================
  // SIDEBAR
  // ============================================================

  const [collapsed, setCollapsed] =
    useState(false);


  // ============================================================
  // SEARCH
  // ============================================================

  const [search, setSearch] =
    useState("");


  // ============================================================
  // STATUS FILTER
  // ============================================================

  const [status, setStatus] =
    useState("All");


  // ============================================================
  // AVAILABLE WASTE
  // ============================================================

  const [wasteData, setWasteData] =
    useState([]);


  // ============================================================
  // EXISTING REQUESTS
  // ============================================================

  const [requests, setRequests] =
    useState([]);


  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] =
    useState(true);


  // ============================================================
  // REQUESTING
  // ============================================================

  const [requestingId, setRequestingId] =
    useState(null);


  // ============================================================
  // SENT REQUEST IDS
  // ============================================================

  const [sentRequestIds, setSentRequestIds] =
    useState(() => {

      try {

        const saved =
          localStorage.getItem(
            "sentWasteRequestIds"
          );

        return saved
          ? JSON.parse(saved)
          : [];

      } catch {

        return [];

      }

    });


  // ============================================================
  // ERROR
  // ============================================================

  const [error, setError] =
    useState("");


  // ============================================================
  // SUCCESS
  // ============================================================

  const [success, setSuccess] =
    useState("");


  // ============================================================
  // GET LOGGED-IN USER
  // ============================================================

  const getCurrentUser = () => {

    try {

      const storedUser =
        localStorage.getItem("user");


      if (!storedUser) {

        return null;

      }


      const user =
        JSON.parse(storedUser);


      return user || null;

    } catch (err) {

      console.error(
        "FAILED TO READ USER:",
        err
      );

      return null;

    }

  };


  // ============================================================
  // CHECK ADMIN / RECYCLER
  // ============================================================

  const canRequestWaste = () => {

    const user =
      getCurrentUser();


    if (!user) {

      return false;

    }


    const role =
      String(
        user.role || ""
      )
        .trim()
        .toLowerCase();


    return (
      role === "recycler" ||
      role === "admin"
    );

  };


  // ============================================================
  // LOAD AVAILABLE WASTE
  // ============================================================

  const fetchWaste = async () => {

    try {

      const data =
        await getAllWaste();


      console.log(
        "AVAILABLE WASTE:",
        data
      );


      const available =
        Array.isArray(data)
          ? data.filter(
              (item) =>
                String(
                  item.status || ""
                )
                  .trim()
                  .toLowerCase() ===
                "available"
            )
          : [];


      setWasteData(
        available
      );

    } catch (err) {

      console.error(
        "FAILED TO LOAD WASTE:",
        err
      );

      setWasteData([]);

    }

  };


  // ============================================================
  // LOAD REQUESTS
  // ============================================================

  const fetchRequests = async () => {

    try {

      const data =
        await getAllWasteRequests();


      console.log(
        "ALL WASTE REQUESTS:",
        data
      );


      setRequests(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "FAILED TO LOAD REQUESTS:",
        err
      );

      setRequests([]);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    const loadData = async () => {

      try {

        setLoading(true);

        setError("");


        await Promise.all([
          fetchWaste(),
          fetchRequests(),
        ]);

      } catch (err) {

        console.error(
          err
        );

      } finally {

        setLoading(false);

      }

    };


    loadData();

  }, []);


  // ============================================================
  // SAVE SENT IDS
  // ============================================================

  useEffect(() => {

    localStorage.setItem(
      "sentWasteRequestIds",
      JSON.stringify(
        sentRequestIds
      )
    );

  }, [
    sentRequestIds,
  ]);


  // ============================================================
  // CHECK WHETHER WASTE ALREADY REQUESTED
  // ============================================================

  const isWasteAlreadyRequested = (
    wasteId
  ) => {

    // ----------------------------------------------------------
    // CURRENT UI SESSION
    // ----------------------------------------------------------

    if (
      sentRequestIds.includes(
        Number(wasteId)
      )
    ) {

      return true;

    }


    // ----------------------------------------------------------
    // BACKEND REQUESTS
    // ----------------------------------------------------------

    return requests.some(
      (request) => {

        const notes =
          String(
            request.notes || ""
          )
            .toLowerCase();


        return (
          notes.includes(
            `waste #${wasteId}`
          ) ||
          notes.includes(
            `waste id #${wasteId}`
          )
        );

      }
    );

  };


  // ============================================================
  // SEND REQUEST
  // ============================================================

  const sendRequest = async (
    waste
  ) => {

    try {

      setError("");

      setSuccess("");


      // ========================================================
      // USER
      // ========================================================

      const user =
        getCurrentUser();


      console.log(
        "CURRENT USER:",
        user
      );


      if (!user) {

        setError(
          "User information not found. Please login again."
        );

        return;

      }


      // ========================================================
      // ROLE
      // ========================================================

      const role =
        String(
          user.role || ""
        )
          .trim()
          .toLowerCase();


      console.log(
        "CURRENT ROLE:",
        role
      );


      // ========================================================
      // ADMIN + RECYCLER ALLOWED
      // ========================================================

      if (
        role !== "recycler" &&
        role !== "admin"
      ) {

        setError(
          `You are logged in as "${role}", not as a recycler or admin.`
        );

        return;

      }


      // ========================================================
      // PREVENT DUPLICATE
      // ========================================================

      if (
        isWasteAlreadyRequested(
          waste.id
        )
      ) {

        setSuccess(
          `Waste #${waste.id} request already sent.`
        );

        return;

      }


      // ========================================================
      // START REQUEST
      // ========================================================

      setRequestingId(
        waste.id
      );


      // ========================================================
      // RECYCLER NAME
      // ========================================================

      const requesterName =
        user.full_name ||
        user.name ||
        user.username ||
        user.email ||
        "Admin";


      // ========================================================
      // MANUFACTURER
      // ========================================================

      const manufacturer =
        waste.manufacturer ||
        waste.manufacturer_name ||
        waste.company ||
        waste.source ||
        "";


      if (!manufacturer) {

        setError(
          "Manufacturer information is missing for this waste."
        );

        return;

      }


      // ========================================================
      // MATERIAL
      // ========================================================

      const material =
        waste.fabric_type ||
        waste.material_type ||
        waste.waste_type ||
        waste.material ||
        "Textile Waste";


      // ========================================================
      // QUANTITY
      // ========================================================

      const quantity =
        Number(
          waste.quantity
        ) || 0;


      // ========================================================
      // UNIT
      // ========================================================

      const unit =
        waste.unit ||
        "Kg";


      // ========================================================
      // PAYLOAD
      // ========================================================

      const payload = {

        manufacturer:
          manufacturer,

        recycler:
          requesterName,

        material:
          material,

        quantity:
          quantity,

        unit:
          unit,

        status:
          "Pending",

        notes:
          `Request created for waste #${waste.id}`,

      };


      console.log(
        "CREATING REQUEST:",
        payload
      );


      // ========================================================
      // CREATE BACKEND REQUEST
      // ========================================================

      const response =
        await createWasteRequest(
          payload
        );


      console.log(
        "REQUEST CREATED:",
        response
      );


      // ========================================================
      // MARK AS SENT
      // ========================================================

      setSentRequestIds(
        (current) => {

          const id =
            Number(
              waste.id
            );


          if (
            current.includes(id)
          ) {

            return current;

          }


          return [
            ...current,
            id,
          ];

        }
      );


      // ========================================================
      // SUCCESS MESSAGE
      // ========================================================

      setSuccess(
        `✓ Request Sent — ${material} request has been sent to ${manufacturer}.`
      );


      // ========================================================
      // REFRESH REQUESTS
      // ========================================================

      await fetchRequests();

    } catch (err) {

      console.error(
        "SEND REQUEST ERROR:",
        err
      );


      const detail =
        err.response?.data?.detail;


      if (
        Array.isArray(detail)
      ) {

        setError(
          detail
            .map(
              (item) =>
                item.msg ||
                "Validation error"
            )
            .join(", ")
        );

      } else {

        setError(
          detail ||
          err.message ||
          "Failed to send waste request."
        );

      }

    } finally {

      setRequestingId(
        null
      );

    }

  };


  // ============================================================
  // REFRESH
  // ============================================================

  const handleRefresh = async () => {

    try {

      setLoading(true);

      setError("");

      setSuccess("");


      await Promise.all([
        fetchWaste(),
        fetchRequests(),
      ]);

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // FILTER
  // ============================================================

  const filteredWaste =
    useMemo(() => {

      const query =
        search
          .trim()
          .toLowerCase();


      return wasteData.filter(
        (item) => {

          const material =
            String(
              item.fabric_type ||
              item.material_type ||
              item.waste_type ||
              item.material ||
              ""
            )
              .toLowerCase();


          const manufacturer =
            String(
              item.manufacturer ||
              item.manufacturer_name ||
              item.company ||
              item.source ||
              ""
            )
              .toLowerCase();


          const location =
            String(
              item.location ||
              ""
            )
              .toLowerCase();


          const id =
            String(
              item.id ||
              ""
            );


          const matchesSearch =
            !query ||
            material.includes(
              query
            ) ||
            manufacturer.includes(
              query
            ) ||
            location.includes(
              query
            ) ||
            id.includes(
              query
            );


          return matchesSearch;

        }
      );

    }, [
      wasteData,
      search,
    ]);


  // ============================================================
  // STATUS CLASS
  // ============================================================

  const getStatusClass = (
    value
  ) => {

    return String(
      value || "Pending"
    )
      .toLowerCase()
      .replace(
        /\s+/g,
        "-"
      );

  };


  // ============================================================
  // RENDER
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
          CONTENT
      ====================================================== */}

      <div
        className={`dashboard-content ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >

        <Navbar />


        <main className="requests-container">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="requests-header">

            <div>

              <span className="section-label">

                WASTE REQUESTS

              </span>


              <h1>

                Request Waste

              </h1>


              <p>

                Select available textile waste
                and send a request to its
                manufacturer.

              </p>

            </div>


            <div className="request-icon">

              <FaClipboardCheck />

            </div>

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="request-error">

              <FaTimesCircle />

              <span>

                {error}

              </span>

            </div>

          )}


          {/* ==================================================
              SUCCESS
          ================================================== */}

          {success && (

            <div className="request-success">

              <FaCheckCircle />

              <span>

                {success}

              </span>

            </div>

          )}


          {/* ==================================================
              TOOLBAR
          ================================================== */}

          <div className="request-toolbar">


            <div className="search-wrapper">

              <FaSearch />

              <input
                type="text"
                placeholder="Search waste, manufacturer or location..."
                value={search}
                onChange={(e) =>
                  setSearch(
                    e.target.value
                  )
                }
              />

            </div>


            <button
              type="button"
              className="refresh-btn"
              onClick={
                handleRefresh
              }
              disabled={loading}
            >

              <FaSyncAlt />

              {loading
                ? "Loading..."
                : "Refresh"}

            </button>

          </div>


          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="request-table-box">


            {loading ? (

              <div className="no-requests">

                <FaSyncAlt />

                <h3>

                  Loading Available Waste...

                </h3>

                <p>

                  Fetching waste from database.

                </p>

              </div>

            ) : filteredWaste.length === 0 ? (

              <div className="no-requests">

                <FaRecycle />

                <h3>

                  No Available Waste

                </h3>

                <p>

                  No manufacturer waste is
                  currently available.

                </p>

              </div>

            ) : (

              <div className="table-scroll">

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
                        Location
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {filteredWaste.map(
                      (item) => {

                        const material =
                          item.fabric_type ||
                          item.material_type ||
                          item.waste_type ||
                          item.material ||
                          "Textile Waste";


                        const quantity =
                          item.quantity ??
                          0;


                        const unit =
                          item.unit ||
                          "Kg";


                        const manufacturer =
                          item.manufacturer ||
                          item.manufacturer_name ||
                          item.company ||
                          item.source ||
                          "Manufacturer";


                        const location =
                          item.location ||
                          "N/A";


                        const alreadyRequested =
                          isWasteAlreadyRequested(
                            item.id
                          );


                        const requesting =
                          requestingId ===
                          item.id;


                        return (

                          <tr
                            key={
                              item.id
                            }
                          >


                            {/* ID */}

                            <td>

                              <strong>

                                #
                                {item.id}

                              </strong>

                            </td>


                            {/* MATERIAL */}

                            <td>

                              <div className="material-cell">

                                <FaRecycle />

                                <span>

                                  {material}

                                </span>

                              </div>

                            </td>


                            {/* QUANTITY */}

                            <td>

                              <strong>

                                {quantity}

                              </strong>

                              {" "}

                              {unit}

                            </td>


                            {/* MANUFACTURER */}

                            <td>

                              <strong>

                                {manufacturer}

                              </strong>

                            </td>


                            {/* LOCATION */}

                            <td>

                              {location}

                            </td>


                            {/* ACTION */}

                            <td>

                              {alreadyRequested ? (

                                <button
                                  type="button"
                                  className="request-btn request-sent-btn"
                                  disabled
                                >

                                  <FaCheckCircle />

                                  <span>

                                    Request Sent

                                  </span>

                                </button>

                              ) : (

                                <button
                                  type="button"
                                  className="request-btn"
                                  disabled={
                                    requesting
                                  }
                                  onClick={() =>
                                    sendRequest(
                                      item
                                    )
                                  }
                                >

                                  {requesting ? (

                                    <>

                                      <FaSyncAlt />

                                      <span>

                                        Sending...

                                      </span>

                                    </>

                                  ) : (

                                    <>

                                      <FaPaperPlane />

                                      <span>

                                        Request Waste

                                      </span>

                                    </>

                                  )}

                                </button>

                              )}

                            </td>


                          </tr>

                        );

                      }
                    )}

                  </tbody>

                </table>

              </div>

            )}

          </div>


          {/* ==================================================
              INFO
          ================================================== */}

          <div className="request-info-card">

            <FaClock />

            <div>

              <h3>

                Request Workflow

              </h3>

              <p>

                Click <strong>Request Waste</strong>
                to send a Pending request to
                the manufacturer. The manufacturer
                can then Approve or Reject the
                request from the Manufacturer
                Requests dashboard.

              </p>

            </div>

          </div>


        </main>

      </div>

    </div>

  );

}


export default RecyclerRequests;