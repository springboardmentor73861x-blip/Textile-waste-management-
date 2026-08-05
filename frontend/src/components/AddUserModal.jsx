import { useState } from "react";
import API from "../services/api";
import "../css/AddUserModal.css";

function AddUserModal({ isOpen, onClose, refreshUsers }) {

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "Manufacturer",
  });

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.full_name ||
      !formData.email ||
      !formData.password ||
      !formData.role
    ) {
      alert("Please fill all fields.");
      return;
    }

    try {
      setLoading(true);

      await API.post("/admin/users", formData);

      alert("User added successfully.");

      setFormData({
        full_name: "",
        email: "",
        password: "",
        role: "Manufacturer",
      });

      refreshUsers();
      onClose();

    } catch (error) {

      alert(
        error.response?.data?.detail ||
        "Failed to add user."
      );

    } finally {

      setLoading(false);

    }
  };

  return (

    <div className="modal-overlay">

      <div className="add-user-modal">

        <div className="modal-header">

          <h2>Add New User</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ×
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Full Name</label>

            <input
              type="text"
              name="full_name"
              placeholder="Enter full name"
              value={formData.full_name}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label>Email</label>

            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={formData.email}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label>Password</label>

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={formData.password}
              onChange={handleChange}
            />

          </div>

          <div className="form-group">

            <label>Role</label>

            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
            >

              <option value="Admin">Admin</option>

              <option value="Manufacturer">
                Manufacturer
              </option>

              <option value="Recycler">
                Recycler
              </option>

              <option value="Supplier">
                Supplier
              </option>

            </select>

          </div>

          <div className="modal-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? "Saving..." : "Add User"}
            </button>

          </div>

        </form>

      </div>

    </div>

  );

}

export default AddUserModal;