import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import API from "../services/api";

import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash
} from "react-icons/fa";

import "../css/ProductionWaste.css";

function ProductionWaste() {

  const [collapsed, setCollapsed] = useState(false);

  const [wasteData, setWasteData] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  useEffect(() => {

    fetchWaste();

  }, []);

  const fetchWaste = async () => {

    try {

      setLoading(true);

      const response = await API.get("/manufacturer/waste");

      setWasteData(response.data);

    } catch (error) {

      console.log(error);

    } finally {

      setLoading(false);

    }

  };
    const deleteWaste = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this waste record?"
    );

    if (!confirmDelete) return;

    try {

      await API.delete(`/manufacturer/waste/${id}`);

      alert("Waste record deleted successfully.");

      fetchWaste();

    } catch (error) {

      console.error(error);

      alert("Delete failed.");

    }

  };

  const filteredWaste = wasteData.filter((item) =>

    item.material
      .toLowerCase()
      .includes(search.toLowerCase())

  );

  return (

    <div className="dashboard">

      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

        <Navbar />

        <div className="production-waste">

          {/* Header */}

          <div className="page-header">

            <div>

              <h1>Production Waste</h1>

              <p>
                Manage all production waste records.
              </p>

            </div>

            <button className="add-btn">

              <FaPlus />

              Add Waste

            </button>

          </div>

          {/* Toolbar */}

          <div className="toolbar">

            <div className="search-box">

              <FaSearch className="search-icon" />

              <input
                type="text"
                placeholder="Search Material..."
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
              />

            </div>

          </div>

          {/* Table */}

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>ID</th>

                  <th>Material</th>

                  <th>Quantity</th>

                  <th>Color</th>

                  <th>Status</th>

                  <th>Actions</th>

                </tr>

              </thead>

              <tbody>

                {loading ? (

                  <tr>

                    <td
                      colSpan="6"
                      style={{ textAlign: "center" }}
                    >
                      Loading...
                    </td>

                  </tr>

                ) : filteredWaste.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      style={{ textAlign: "center" }}
                    >
                      No Waste Records Found
                    </td>

                  </tr>

                ) : (

                  filteredWaste.map((item) => (

                    <tr key={item.id}>

                      <td>{item.id}</td>

                      <td>{item.material}</td>

                      <td>{item.quantity}</td>

                      <td>{item.color}</td>

                      <td>

                        <span className="status">

                          {item.status}

                        </span>

                      </td>

                      <td className="actions">

                        <FaEdit className="edit" />

                        <FaTrash
                          className="delete"
                          onClick={() =>
                            deleteWaste(item.id)
                          }
                        />

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </div>

  );

}

export default ProductionWaste;