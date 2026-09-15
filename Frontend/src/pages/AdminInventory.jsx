import { useEffect, useState } from "react";
import API from "../api/auth";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/AdminInventory.css";

function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInventory = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await API.get("/inventory/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setItems(response.data);
    } catch (error) {
      console.error("Admin inventory fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this inventory record?"
    );

    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem("token");

      await API.delete(`/inventory/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      fetchInventory();
    } catch (error) {
      console.error("Delete inventory error:", error);
      alert("Unable to delete inventory record.");
    }
  };

  return (
  <div className="admin-layout">
    <AdminSidebar />

    <main className="admin-content">
      <div className="user-management">

      <div className="admin-inventory-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Manage textile waste inventory records.</p>
        </div>

        <div className="admin-inventory-count">
          Total Records: {items.length}
        </div>
      </div>

      <div className="admin-inventory-table-container">

        {loading ? (
          <p className="inventory-loading">Loading inventory...</p>
        ) : (
          <table className="admin-inventory-table">

            <thead>
              <tr>
                <th>Batch ID</th>
                <th>Fabric</th>
                <th>Source</th>
                <th>Quantity</th>
                <th>Color</th>
                <th>Condition</th>
                <th>Collection Date</th>
                <th>Waste Category</th>
                <th>Recyclability</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr key={item.id}>

                    <td>{item.batch_id}</td>
                    <td>{item.fabric_type}</td>
                    <td>{item.source}</td>
                    <td>{item.quantity}</td>
                    <td>{item.color || "-"}</td>
                    <td>{item.condition || "-"}</td>

                    <td>
                      {item.collection_date
                        ? new Date(
                            item.collection_date
                          ).toLocaleDateString()
                        : "-"}
                    </td>

                    <td>{item.waste_category || "-"}</td>
                    <td>{item.recyclability || "-"}</td>

                    <td>
                      <span className="admin-status-badge">
                        {item.status}
                      </span>
                    </td>

                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(item.id)}
                      >
                        Delete
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="11" className="empty-admin-inventory">
                    No inventory records found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        )}

      </div>
      

    </div>
    </main>
    </div>
  );
}

export default AdminInventory;