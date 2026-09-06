import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  getAllWaste,
  createWasteRequest,
} from "../services/api";

import {
  FaRecycle,
  FaPaperPlane,
  FaSyncAlt,
  FaExclamationCircle,
  FaCheckCircle,
} from "react-icons/fa";

import "../css/RequestWaste.css";


function RequestWaste() {

  // ============================================================
  // SIDEBAR
  // ============================================================

  const [collapsed, setCollapsed] = useState(false);


  // ============================================================
  // WASTE
  // ============================================================

  const [wasteData, setWasteData] = useState([]);


  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] = useState(true);

  const [requestingId, setRequestingId] = useState(null);


  // ============================================================
  // MESSAGES
  // ============================================================

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // ============================================================
  // LOAD AVAILABLE WASTE
  // ============================================================

  const loadWaste = async () => {

    try {

      setLoading(true);
      setError("");

      const data = await getAllWaste();

      console.log("======================================");
      console.log("AVAILABLE WASTE");
      console.log(data);
      console.log("======================================");


      const available = Array.isArray(data)
        ? data.filter((item) => {

            const status = String(
              item?.status || ""
            )
              .trim()
              .toLowerCase();

            return status === "available";

          })
        : [];


      setWasteData(available);

    } catch (err) {

      console.error(
        "LOAD WASTE ERROR:",
        err
      );

      const detail =
        err?.response?.data?.detail;

      if (Array.isArray(detail)) {

        setError(
          detail
            .map(
              (item) =>
                item?.msg ||
                "Validation error"
            )
            .join(", ")
        );

      } else {

        setError(
          detail ||
          "Failed to load available waste."
        );

      }

      setWasteData([]);

    } finally {

      setLoading(false);

    }

  };


  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {

    loadWaste();

  }, []);


  // ============================================================
  // GET CURRENT USER
  // ============================================================

  const getCurrentUser = () => {

    try {

      const raw =
        localStorage.getItem("user");

      if (raw) {

        const user =
          JSON.parse(raw);

        return user;

      }

    } catch (error) {

      console.error(
        "Failed to read stored user:",
        error
      );

    }

    return null;

  };


  // ============================================================
  // GET CURRENT RECYCLER
  // ============================================================

  const getCurrentRecycler = () => {

    const user =
      getCurrentUser();


    if (user?.full_name) {

      return String(
        user.full_name
      ).trim();

    }


    const recycler =
      localStorage.getItem(
        "full_name"
      ) ||
      localStorage.getItem(
        "user_name"
      ) ||
      localStorage.getItem(
        "name"
      ) ||
      localStorage.getItem(
        "email"
      );


    return recycler
      ? String(recycler).trim()
      : "";

  };


  // ============================================================
  // GET CURRENT USER ID
  // ============================================================

  const getCurrentUserId = () => {

    const user =
      getCurrentUser();

    if (user?.id) {

      return Number(user.id);

    }

    const storedId =
      localStorage.getItem(
        "user_id"
      );

    if (storedId) {

      return Number(storedId);

    }

    return null;

  };


  // ============================================================
  // GET MANUFACTURER NAME
  // ============================================================

  const getManufacturer = (item) => {

    const manufacturer =
      item?.manufacturer ||
      item?.manufacturer_name ||
      item?.manufacturer_full_name ||
      item?.owner_name ||
      item?.company ||
      "";


    if (!manufacturer) {

      return "";

    }


    return String(
      manufacturer
    ).trim();

  };


  // ============================================================
  // GET MANUFACTURER ID
  // ============================================================

  const getManufacturerId = (item) => {

    const id =
      item?.manufacturer_id ||
      item?.owner_id ||
      item?.user_id ||
      null;


    if (
      id === null ||
      id === undefined ||
      id === ""
    ) {

      return null;

    }


    const numberId =
      Number(id);


    return Number.isNaN(numberId)
      ? null
      : numberId;

  };


  // ============================================================
  // CHECK INVALID SOURCE
  // ============================================================

  const isInvalidManufacturer = (
    manufacturer
  ) => {

    if (!manufacturer) {

      return true;

    }


    const value =
      String(manufacturer)
        .trim()
        .toLowerCase();


    const invalidSources = [

      "industrial",

      "industrial waste",

      "manufacturing",

      "garment production",

      "collection center",

      "household",

      "retail",

      "donation center",

      "production",

      "production unit",

      "textile waste",

      "other",

    ];


    return invalidSources.includes(
      value
    );

  };


  // ============================================================
  // SEND REQUEST
  // ============================================================

  const handleRequest = async (
    item
  ) => {

    try {

      setRequestingId(item.id);

      setError("");
      setSuccess("");


      // ========================================================
      // CURRENT RECYCLER
      // ========================================================

      const recycler =
        getCurrentRecycler();


      const recyclerId =
        getCurrentUserId();


      if (!recycler) {

        setError(
          "Recycler information not found. Please login again."
        );

        return;

      }


      // ========================================================
      // MANUFACTURER ID
      // ========================================================

      const manufacturerId =
        getManufacturerId(item);


      // ========================================================
      // MANUFACTURER NAME
      // ========================================================

      const manufacturer =
        getManufacturer(item);


      // ========================================================
      // DEBUG
      // ========================================================

      console.log(
        "=========================================="
      );

      console.log(
        "SELECTED WASTE"
      );

      console.log(
        item
      );

      console.log(
        "MANUFACTURER ID:",
        manufacturerId
      );

      console.log(
        "MANUFACTURER:",
        manufacturer
      );

      console.log(
        "SOURCE:",
        item?.source
      );

      console.log(
        "RECYCLER ID:",
        recyclerId
      );

      console.log(
        "RECYCLER:",
        recycler
      );

      console.log(
        "=========================================="
      );


      // ========================================================
      // MANUFACTURER ID IS REQUIRED
      // ========================================================

      if (!manufacturerId) {

        setError(
          "This waste does not have a registered manufacturer ID. Please edit this waste and select the actual manufacturer/user."
        );

        return;

      }


      // ========================================================
      // MANUFACTURER NAME REQUIRED
      // ========================================================

      if (!manufacturer) {

        setError(
          "Manufacturer information is missing for this waste."
        );

        return;

      }


      // ========================================================
      // PREVENT SOURCE AS MANUFACTURER
      // ========================================================

      if (
        isInvalidManufacturer(
          manufacturer
        )
      ) {

        setError(
          `"${manufacturer}" is a waste source, not a registered manufacturer. Please update this waste with the actual manufacturer.`
        );

        return;

      }


      // ========================================================
      // MATERIAL
      // ========================================================

      const material =
        item?.fabric_type ||
        item?.material_type ||
        item?.waste_type ||
        item?.material ||
        "Waste";


      // ========================================================
      // QUANTITY
      // ========================================================

      const quantity =
        Number(
          item?.quantity ?? 0
        );


      if (
        Number.isNaN(quantity) ||
        quantity <= 0
      ) {

        setError(
          "Invalid waste quantity."
        );

        return;

      }


      // ========================================================
      // UNIT
      // ========================================================

      const unit =
        item?.unit ||
        "Kg";


      // ========================================================
      // CREATE REQUEST
      // ========================================================

      const requestData = {

        // IMPORTANT:
        // Send manufacturer ID.
        manufacturer_id:
          manufacturerId,

        // Keep name as fallback.
        manufacturer:
          manufacturer,

        recycler:
          recycler,

        material:
          material,

        quantity:
          quantity,

        unit:
          unit,

        status:
          "Pending",

        machine:
          "",

        progress:
          0,

        notes:
          `Waste request for waste ID #${item.id}`,

      };


      // ========================================================
      // DEBUG REQUEST
      // ========================================================

      console.log(
        "=========================================="
      );

      console.log(
        "SENDING WASTE REQUEST"
      );

      console.log(
        requestData
      );

      console.log(
        "=========================================="
      );


      // ========================================================
      // API
      // ========================================================

      const response =
        await createWasteRequest(
          requestData
        );


      console.log(
        "=========================================="
      );

      console.log(
        "REQUEST CREATED"
      );

      console.log(
        response
      );

      console.log(
        "=========================================="
      );


      // ========================================================
      // SUCCESS
      // ========================================================

      setSuccess(
        `Request sent successfully to ${manufacturer} for ${material}.`
      );


      // ========================================================
      // REMOVE REQUESTED WASTE
      // ========================================================

      setWasteData(
        (current) =>
          current.filter(
            (waste) =>
              waste.id !== item.id
          )
      );


    } catch (err) {

      console.error(
        "=========================================="
      );

      console.error(
        "SEND WASTE REQUEST ERROR"
      );

      console.error(
        err
      );

      console.error(
        "STATUS:",
        err?.response?.status
      );

      console.error(
        "BACKEND RESPONSE:",
        err?.response?.data
      );

      console.error(
        "=========================================="
      );


      const detail =
        err?.response?.data?.detail;


      if (Array.isArray(detail)) {

        setError(
          detail
            .map(
              (item) =>
                item?.msg ||
                "Validation error"
            )
            .join(", ")
        );

      } else {

        setError(
          detail ||
          "Failed to send waste request."
        );

      }

    } finally {

      setRequestingId(null);

    }

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


        <div className="requests-container">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="requests-header">

            <div>

              <span className="section-label">

                WASTE REQUEST

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

              <FaRecycle />

            </div>

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="request-error">

              <FaExclamationCircle />

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

                  Fetching waste from inventory.

                </p>

              </div>

            ) : wasteData.length === 0 ? (

              <div className="no-requests">

                <FaRecycle />

                <h3>

                  No Available Waste

                </h3>

                <p>

                  There is currently no waste
                  available for requesting.

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
                        Source
                      </th>

                      <th>
                        Location
                      </th>

                      <th>
                        Status
                      </th>

                      <th>
                        Action
                      </th>

                    </tr>

                  </thead>


                  <tbody>

                    {wasteData.map(
                      (item) => {


                        // ==================================================
                        // MATERIAL
                        // ==================================================

                        const material =
                          item?.fabric_type ||
                          item?.material_type ||
                          item?.waste_type ||
                          item?.material ||
                          "N/A";


                        // ==================================================
                        // QUANTITY
                        // ==================================================

                        const quantity =
                          item?.quantity ??
                          0;


                        // ==================================================
                        // UNIT
                        // ==================================================

                        const unit =
                          item?.unit ||
                          "Kg";


                        // ==================================================
                        // MANUFACTURER
                        // ==================================================

                        const manufacturer =
                          getManufacturer(
                            item
                          );


                        const manufacturerId =
                          getManufacturerId(
                            item
                          );


                        const validManufacturer =
                          manufacturer &&
                          manufacturerId &&
                          !isInvalidManufacturer(
                            manufacturer
                          );


                        // ==================================================
                        // SOURCE
                        // ==================================================

                        const source =
                          item?.source ||
                          "N/A";


                        // ==================================================
                        // LOCATION
                        // ==================================================

                        const location =
                          item?.location ||
                          "N/A";


                        // ==================================================
                        // REQUESTING
                        // ==================================================

                        const isRequesting =
                          requestingId ===
                          item.id;


                        return (

                          <tr
                            key={item.id}
                          >


                            {/* ID */}

                            <td>

                              <strong>
                                #{item.id}
                              </strong>

                            </td>


                            {/* MATERIAL */}

                            <td>

                              <div className="material-cell">

                                <FaRecycle />

                                <strong>
                                  {material}
                                </strong>

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

                              {manufacturer ? (

                                <strong>
                                  {manufacturer}
                                </strong>

                              ) : (

                                <span>
                                  Manufacturer not available
                                </span>

                              )}

                            </td>


                            {/* SOURCE */}

                            <td>
                              {source}
                            </td>


                            {/* LOCATION */}

                            <td>
                              {location}
                            </td>


                            {/* STATUS */}

                            <td>

                              <span className="request-status pending">

                                Available

                              </span>

                            </td>


                            {/* ACTION */}

                            <td>

                              <button
                                type="button"
                                className="request-waste-btn"
                                disabled={
                                  isRequesting ||
                                  !validManufacturer
                                }
                                onClick={() =>
                                  handleRequest(
                                    item
                                  )
                                }
                              >

                                {isRequesting ? (

                                  <>

                                    <FaSyncAlt />

                                    Sending...

                                  </>

                                ) : (

                                  <>

                                    <FaPaperPlane />

                                    Request Waste

                                  </>

                                )}

                              </button>


                              {!validManufacturer && (

                                <small
                                  style={{
                                    display:
                                      "block",
                                    marginTop:
                                      "6px",
                                    color:
                                      "#dc2626",
                                  }}
                                >
                                  Manufacturer ID missing
                                </small>

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
              WORKFLOW
          ================================================== */}

          <div className="request-workflow">

            <h3>
              Request Workflow
            </h3>

            <p>

              Click <strong>Request Waste</strong>
              to send a Pending request to the
              manufacturer. The manufacturer can
              then Approve or Reject the request
              from the Manufacturer Requests
              dashboard.

            </p>

          </div>


        </div>

      </div>

    </div>

  );

}


export default RequestWaste;