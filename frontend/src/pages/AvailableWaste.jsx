import {
  useEffect,
  useState,
} from "react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

import {
  getAllWaste,
} from "../services/api";

import {
  FaRecycle,
  FaSearch,
} from "react-icons/fa";

import "../css/AvailableWaste.css";


function AvailableWaste() {

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
  // WASTE
  // ============================================================

  const [wasteData, setWasteData] =
    useState([]);


  // ============================================================
  // LOADING
  // ============================================================

  const [loading, setLoading] =
    useState(true);


  // ============================================================
  // ERROR
  // ============================================================

  const [error, setError] =
    useState("");


  // ============================================================
  // LOAD WASTE
  // ============================================================

  const loadWaste = async () => {

    try {

      setLoading(true);
      setError("");

      const data =
        await getAllWaste();

      console.log(
        "ALL WASTE:",
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

      const detail =
        err.response?.data?.detail;

      if (Array.isArray(detail)) {

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
  // SEARCH
  // ============================================================

  const filteredWaste =
    wasteData.filter(
      (item) => {

        const query =
          search
            .trim()
            .toLowerCase();

        if (!query) {
          return true;
        }

        const searchableText = [

          item.id,

          item.waste_type,

          item.material_type,

          item.fabric_type,

          item.location,

          item.source,

          item.manufacturer,

          item.manufacturer_name,

          item.company,

        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          query
        );

      }
    );


  // ============================================================
  // RENDER
  // ============================================================

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />


      <div
        className={`dashboard-content ${
          collapsed
            ? "collapsed"
            : ""
        }`}
      >

        <Navbar />


        <div className="available-container">


          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="available-header">

            <div>

              <span className="available-label">
                RECYCLING INVENTORY
              </span>

              <h1>
                Available Waste
              </h1>

              <p>
                Browse textile waste uploaded
                by manufacturers.
              </p>

            </div>


            <div className="available-header-icon">
              <FaRecycle />
            </div>

          </div>


          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (

            <div className="available-error">
              {error}
            </div>

          )}


          {/* ==================================================
              SEARCH
          ================================================== */}

          <div className="available-toolbar">

            <div className="available-search-wrapper">

              <FaSearch />

              <input
                type="text"
                placeholder="Search waste, material, manufacturer or location..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                className="available-search"
              />

            </div>

          </div>


          {/* ==================================================
              TABLE
          ================================================== */}

          <div className="available-table-container">

            {loading ? (

              <div className="available-state">

                <h3>
                  Loading Available Waste...
                </h3>

                <p>
                  Fetching waste from FastAPI.
                </p>

              </div>

            ) : filteredWaste.length === 0 ? (

              <div className="available-state">

                <h3>
                  No Available Waste
                </h3>

                <p>
                  {search
                    ? "No waste matches your search."
                    : "No manufacturer waste is currently available."}
                </p>

              </div>

            ) : (

              <div className="table-scroll">

                <table className="available-table">

                  <thead>

                    <tr>

                      <th>
                        ID
                      </th>

                      <th>
                        Image
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

                    </tr>

                  </thead>


                  <tbody>

                    {filteredWaste.map(
                      (item) => {

                        const material =
                          item.material ||
                          item.fabric_type ||
                          item.material_type ||
                          item.waste_type ||
                          "N/A";

                        const quantity =
                          item.quantity ?? 0;

                        const unit =
                          item.unit || "Kg";

                        const manufacturer =
                          item.manufacturer ||
                          item.manufacturer_name ||
                          item.company ||
                          item.source ||
                          "Manufacturer";

                        const location =
                          item.location ||
                          "N/A";

                        const image =
                          item.image_url ||
                          item.image ||
                          item.photo_url ||
                          "";


                        return (

                          <tr
                            key={item.id}
                          >

                            <td>

                              <strong>
                                #{item.id}
                              </strong>

                            </td>


                            <td>

                              {image ? (

                                <img
                                  src={image}
                                  alt={material}
                                  className="available-img"
                                />

                              ) : (

                                <div className="available-img-placeholder">
                                  🧵
                                </div>

                              )}

                            </td>


                            <td>

                              <div className="material-cell">

                                <FaRecycle />

                                <strong>
                                  {material}
                                </strong>

                              </div>

                            </td>


                            <td>

                              <strong>
                                {quantity}
                              </strong>

                              {" "}

                              {unit}

                            </td>


                            <td>
                              {manufacturer}
                            </td>


                            <td>
                              {location}
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

        </div>

      </div>

    </div>

  );

}


export default AvailableWaste;