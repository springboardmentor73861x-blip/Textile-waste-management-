import { useState } from "react";
import API from "../services/api";
import "../css/AddUserModal.css";

function AddUserModal({
  isOpen,
  onClose,
  refreshUsers,
}) {
  // ==========================================================
  // FORM DATA
  // ==========================================================

  const initialForm = {
    full_name: "",
    email: "",
    password: "",
    role: "manufacturer",
  };

  const [formData, setFormData] =
    useState(initialForm);

  // ==========================================================
  // STATE
  // ==========================================================

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ==========================================================
  // CLOSE MODAL
  // ==========================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    setFormData(initialForm);
    setError("");

    onClose();
  };

  // ==========================================================
  // INPUT CHANGE
  // ==========================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Clear error while typing
    if (error) {
      setError("");
    }
  };

  // ==========================================================
  // VALIDATION
  // ==========================================================

  const validateForm = () => {
    const fullName =
      formData.full_name.trim();

    const email =
      formData.email.trim();

    const password =
      formData.password;

    const role =
      formData.role.trim();

    if (!fullName) {
      return "Full name is required.";
    }

    if (!email) {
      return "Email is required.";
    }

    if (!password) {
      return "Password is required.";
    }

    if (!role) {
      return "Please select a role.";
    }

    if (password.length < 1) {
      return "Password cannot be empty.";
    }

    return "";
  };

  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    // --------------------------------------------------------
    // VALIDATE
    // --------------------------------------------------------

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    // --------------------------------------------------------
    // PREPARE DATA
    // --------------------------------------------------------

    const payload = {
      full_name:
        formData.full_name.trim(),

      email:
        formData.email.trim().toLowerCase(),

      password:
        formData.password,

      role:
        formData.role.trim().toLowerCase(),
    };

    try {
      setLoading(true);

      console.log(
        "Creating user:",
        {
          ...payload,
          password: "***",
        }
      );

      // ======================================================
      // BACKEND
      //
      // POST /api/admin/users
      // ======================================================

      const response =
        await API.post(
          "/admin/users",
          payload
        );

      console.log(
        "Create user response:",
        response.data
      );

      // ======================================================
      // SUCCESS
      // ======================================================

      // Refresh users table from PostgreSQL
      if (refreshUsers) {
        await refreshUsers();
      }

      // Reset form
      setFormData(initialForm);

      setError("");

      // Close modal
      onClose();

      alert(
        response.data?.message ||
        "User added successfully."
      );

    } catch (error) {
      console.error(
        "========== ADD USER ERROR =========="
      );

      console.error(error);

      console.error(
        "Status:",
        error.response?.status
      );

      console.error(
        "Response:",
        error.response?.data
      );

      // ======================================================
      // BACKEND ERROR
      // ======================================================

      const backendError =
        error.response?.data?.detail ||
        error.response?.data?.message;

      if (backendError) {
        setError(
          backendError
        );
      } else {
        setError(
          "Failed to add user. Please check the backend."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // DON'T RENDER WHEN CLOSED
  // ==========================================================

  if (!isOpen) {
    return null;
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      className="modal-overlay"
      onMouseDown={(event) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          handleClose();
        }
      }}
    >

      <div
        className="add-user-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* ==================================================
            HEADER
        =================================================== */}

        <div className="modal-header">

          <div>
            <h2>
              Add New User
            </h2>

            <p>
              Create a new platform user.
            </p>
          </div>

          <button
            type="button"
            className="close-btn"
            onClick={handleClose}
            disabled={loading}
          >
            ×
          </button>

        </div>

        {/* ==================================================
            ERROR
        =================================================== */}

        {error && (
          <div
            className="modal-error"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* ==================================================
            FORM
        =================================================== */}

        <form
          onSubmit={handleSubmit}
        >

          {/* =================================================
              FULL NAME
          ================================================= */}

          <div className="form-group">

            <label htmlFor="full_name">
              Full Name
            </label>

            <input
              id="full_name"
              type="text"
              name="full_name"
              placeholder="Enter full name"
              value={
                formData.full_name
              }
              onChange={
                handleChange
              }
              disabled={loading}
              autoComplete="name"
            />

          </div>

          {/* =================================================
              EMAIL
          ================================================= */}

          <div className="form-group">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter email"
              value={
                formData.email
              }
              onChange={
                handleChange
              }
              disabled={loading}
              autoComplete="email"
            />

          </div>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div className="form-group">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              placeholder="Enter password"
              value={
                formData.password
              }
              onChange={
                handleChange
              }
              disabled={loading}
              autoComplete="new-password"
            />

            <small>
              Password must not exceed
              72 UTF-8 bytes.
            </small>

          </div>

          {/* =================================================
              ROLE
          ================================================= */}

          <div className="form-group">

            <label htmlFor="role">
              Role
            </label>

            <select
              id="role"
              name="role"
              value={
                formData.role
              }
              onChange={
                handleChange
              }
              disabled={loading}
            >

              <option value="admin">
                Admin
              </option>

              <option value="manufacturer">
                Manufacturer
              </option>

              <option value="recycler">
                Recycler
              </option>

              <option value="manager">
                Manager
              </option>

            </select>

          </div>

          {/* =================================================
              BUTTONS
          =================================================== */}

          <div className="modal-buttons">

            <button
              type="button"
              className="cancel-btn"
              onClick={handleClose}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >

              {loading
                ? "Creating..."
                : "Add User"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default AddUserModal;