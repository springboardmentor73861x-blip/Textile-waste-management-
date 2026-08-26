import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import UserModal from "../components/UserModal";
import AddUserModal from "../components/AddUserModal";

import { useState, useEffect, useCallback } from "react";
import API from "../services/api";

import {
  FaSearch,
  FaPlus,
  FaEye,
  FaTrash,
  FaSyncAlt,
} from "react-icons/fa";

import "../css/UserManagement.css";


function UserManagement() {

  // ==========================================================
  // SIDEBAR
  // ==========================================================

  const [collapsed, setCollapsed] = useState(false);


  // ==========================================================
  // USERS
  // ==========================================================

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [deletingId, setDeletingId] = useState(null);

  const [viewingUserId, setViewingUserId] = useState(null);


  // ==========================================================
  // SEARCH / FILTER
  // ==========================================================

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("All");


  // ==========================================================
  // MODALS
  // ==========================================================

  const [selectedUser, setSelectedUser] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);


  // ==========================================================
  // FETCH ALL USERS
  //
  // GET /api/admin/users
  // ==========================================================

  const fetchUsers = useCallback(async () => {

    try {

      setLoading(true);

      setError("");

      console.log(
        "======================================"
      );

      console.log(
        "FETCHING USERS"
      );

      console.log(
        "GET /api/admin/users"
      );

      console.log(
        "======================================"
      );


      const response = await API.get(
        "/admin/users"
      );


      console.log(
        "Users API Response:",
        response.data
      );


      // ======================================================
      // YOUR BACKEND CURRENTLY RETURNS:
      //
      // [
      //   {
      //     id,
      //     full_name,
      //     email,
      //     role
      //   }
      // ]
      // ======================================================

      let userData = [];

      if (Array.isArray(response.data)) {

        userData = response.data;

      } else if (
        Array.isArray(
          response.data?.users
        )
      ) {

        userData =
          response.data.users;

      } else if (
        Array.isArray(
          response.data?.data
        )
      ) {

        userData =
          response.data.data;

      } else {

        console.error(
          "Unexpected users response:",
          response.data
        );

        throw new Error(
          "Invalid response received from server."
        );

      }


      setUsers(userData);

    } catch (error) {

      console.error(
        "======================================"
      );

      console.error(
        "FETCH USERS ERROR"
      );

      console.error(
        error
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      console.error(
        "======================================"
      );


      setUsers([]);


      setError(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Unable to load users. Please check the backend."
      );

    } finally {

      setLoading(false);

    }

  }, []);


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    fetchUsers();

  }, [fetchUsers]);


  // ==========================================================
  // VIEW SINGLE USER
  //
  // GET /api/admin/users/{user_id}
  // ==========================================================

  const viewUser = async (id) => {

    try {

      setViewingUserId(id);

      setError("");

      console.log(
        "======================================"
      );

      console.log(
        "FETCHING USER DETAILS"
      );

      console.log(
        `GET /api/admin/users/${id}`
      );

      console.log(
        "======================================"
      );


      const response = await API.get(
        `/admin/users/${id}`
      );


      console.log(
        "User Details Response:",
        response.data
      );


      // ======================================================
      // BACKEND CURRENTLY RETURNS:
      //
      // {
      //   id,
      //   full_name,
      //   email,
      //   role
      // }
      // ======================================================

      const user =
        response?.data?.user ??
        response?.data?.data ??
        response?.data;


      if (
        !user ||
        !user.id
      ) {

        throw new Error(
          "Invalid user details received from server."
        );

      }


      setSelectedUser(
        user
      );


    } catch (error) {

      console.error(
        "======================================"
      );

      console.error(
        "VIEW USER ERROR"
      );

      console.error(
        error
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      console.error(
        "======================================"
      );


      setError(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Failed to load user details."
      );


    } finally {

      setViewingUserId(
        null
      );

    }

  };


  // ==========================================================
  // DELETE USER
  //
  // DELETE /api/admin/users/{user_id}
  // ==========================================================

  const deleteUser = async (id) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this user?"
      );


    if (!confirmDelete) {

      return;

    }


    try {

      setDeletingId(id);

      setError("");


      console.log(
        "======================================"
      );

      console.log(
        "DELETING USER"
      );

      console.log(
        `DELETE /api/admin/users/${id}`
      );

      console.log(
        "======================================"
      );


      const response =
        await API.delete(
          `/admin/users/${id}`
        );


      console.log(
        "Delete User Response:",
        response.data
      );


      alert(
        response?.data?.message ||
        "User deleted successfully."
      );


      // ======================================================
      // REMOVE IMMEDIATELY FROM UI
      // ======================================================

      setUsers(
        (currentUsers) =>
          currentUsers.filter(
            (user) =>
              user.id !== id
          )
      );


      // ======================================================
      // OPTIONAL REFRESH
      // ======================================================

      await fetchUsers();


    } catch (error) {

      console.error(
        "======================================"
      );

      console.error(
        "DELETE USER ERROR"
      );

      console.error(
        error
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      console.error(
        "======================================"
      );


      const message =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to delete user.";


      setError(
        message
      );


      alert(
        message
      );


    } finally {

      setDeletingId(
        null
      );

    }

  };


  // ==========================================================
  // ADD USER SUCCESS
  //
  // AddUserModal can call refreshUsers()
  // after successful POST.
  // ==========================================================

  const handleAddUserSuccess = async () => {

    setShowAddModal(false);

    await fetchUsers();

  };


  // ==========================================================
  // FILTER USERS
  // ==========================================================

  const normalizedSearch =
    search
      .trim()
      .toLowerCase();


  const filteredUsers =
    users.filter(
      (user) => {

        const name =
          String(
            user?.full_name ||
            ""
          )
            .toLowerCase();


        const email =
          String(
            user?.email ||
            ""
          )
            .toLowerCase();


        const role =
          String(
            user?.role ||
            ""
          )
            .trim()
            .toLowerCase();


        const matchesSearch =
          name.includes(
            normalizedSearch
          ) ||
          email.includes(
            normalizedSearch
          );


        const matchesRole =
          roleFilter === "All" ||
          role ===
            roleFilter
              .trim()
              .toLowerCase();


        return (
          matchesSearch &&
          matchesRole
        );

      }
    );


  // ==========================================================
  // FORMAT ROLE
  // ==========================================================

  const formatRole = (
    role
  ) => {

    const value =
      String(
        role || ""
      )
        .trim()
        .toLowerCase();


    if (!value) {

      return "-";

    }


    return (
      value.charAt(0).toUpperCase() +
      value.slice(1)
    );

  };


  // ==========================================================
  // CLOSE USER MODAL
  // ==========================================================

  const closeUserModal = () => {

    setSelectedUser(
      null
    );

  };


  // ==========================================================
  // CLOSE ADD MODAL
  // ==========================================================

  const closeAddModal = () => {

    setShowAddModal(
      false
    );

  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="dashboard">


      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <Sidebar
        collapsed={
          collapsed
        }
        setCollapsed={
          setCollapsed
        }
      />


      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <div
        className={
          `dashboard-content ${
            collapsed
              ? "collapsed"
              : ""
          }`
        }
      >


        {/* ===================================================
            NAVBAR
        =================================================== */}

        <Navbar />


        {/* ===================================================
            USER MANAGEMENT
        =================================================== */}

        <div className="user-management">


          {/* =================================================
              HEADER
          ================================================= */}

          <div className="page-header">

            <div>

              <h1>
                User Management
              </h1>

              <p>
                Manage all registered users.
              </p>

            </div>


            <button
              type="button"
              className="add-user-btn"
              onClick={() =>
                setShowAddModal(
                  true
                )
              }
            >

              <FaPlus />

              <span>
                Add User
              </span>

            </button>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div
              className="api-error-message"
              role="alert"
            >

              <strong>
                Error:
              </strong>{" "}

              {error}

            </div>

          )}


          {/* =================================================
              TOOLBAR
          ================================================= */}

          <div className="toolbar">


            {/* SEARCH */}

            <div className="search-box">

              <FaSearch
                className="search-icon"
              />


              <input
                type="text"
                placeholder="Search user..."
                value={
                  search
                }
                onChange={(
                  event
                ) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>


            {/* ROLE FILTER */}

            <select
              value={
                roleFilter
              }
              onChange={(
                event
              ) =>
                setRoleFilter(
                  event.target.value
                )
              }
            >

              <option value="All">
                All Roles
              </option>

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


            {/* REFRESH */}

            <button
              type="button"
              className="refresh-users-btn"
              onClick={
                fetchUsers
              }
              disabled={
                loading
              }
              title="Refresh users"
            >

              <FaSyncAlt
                className={
                  loading
                    ? "refresh-spinning"
                    : ""
                }
              />

            </button>

          </div>


          {/* =================================================
              USER COUNT
          ================================================= */}

          <div className="user-count">

            Showing{" "}

            <strong>
              {
                filteredUsers.length
              }
            </strong>

            {" "}of{" "}

            <strong>
              {
                users.length
              }
            </strong>

            {" "}users

          </div>


          {/* =================================================
              TABLE
          ================================================= */}

          <div className="table-container">

            <table>

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Name
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Role
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Actions
                  </th>

                </tr>

              </thead>


              <tbody>


                {/* ===========================================
                    LOADING
                =========================================== */}

                {loading ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="table-message"
                    >

                      <div className="table-loading">

                        <FaSyncAlt
                          className="refresh-spinning"
                        />

                        <span>
                          Loading users...
                        </span>

                      </div>

                    </td>

                  </tr>

                )


                /* ===========================================
                    NO USERS
                =========================================== */

                : filteredUsers.length === 0 ? (

                  <tr>

                    <td
                      colSpan="6"
                      className="table-message"
                    >

                      {users.length === 0
                        ? "No users found."
                        : "No users match your search or role filter."
                      }

                    </td>

                  </tr>

                )


                /* ===========================================
                    USERS
                =========================================== */

                : (

                  filteredUsers.map(
                    (
                      user
                    ) => (

                      <tr
                        key={
                          user.id
                        }
                      >


                        {/* ID */}

                        <td>
                          {
                            user.id
                          }
                        </td>


                        {/* NAME */}

                        <td>

                          <strong>
                            {
                              user.full_name
                            }
                          </strong>

                        </td>


                        {/* EMAIL */}

                        <td>
                          {
                            user.email
                          }
                        </td>


                        {/* ROLE */}

                        <td>

                          <span
                            className={
                              `role-badge role-${String(
                                user.role ||
                                ""
                              )
                                .trim()
                                .toLowerCase()}`
                            }
                          >

                            {
                              formatRole(
                                user.role
                              )
                            }

                          </span>

                        </td>


                        {/* STATUS */}

                        <td>

                          {/* =================================
                              YOUR CURRENT USER API DOES NOT
                              RETURN A STATUS FIELD.
                              Therefore this remains Active
                              until status is added to the
                              User model/backend.
                          ================================== */}

                          <span
                            className="status active"
                          >

                            Active

                          </span>

                        </td>


                        {/* ACTIONS */}

                        <td className="actions">


                          {/* VIEW */}

                          <button
                            type="button"
                            className="icon-action view"
                            title="View User"
                            disabled={
                              viewingUserId ===
                              user.id
                            }
                            onClick={() =>
                              viewUser(
                                user.id
                              )
                            }
                          >

                            {
                              viewingUserId ===
                              user.id
                                ? (
                                  <FaSyncAlt
                                    className="refresh-spinning"
                                  />
                                )
                                : (
                                  <FaEye />
                                )
                            }

                          </button>


                          {/* DELETE */}

                          <button
                            type="button"
                            className="icon-action delete"
                            title="Delete User"
                            disabled={
                              deletingId ===
                              user.id
                            }
                            onClick={() =>
                              deleteUser(
                                user.id
                              )
                            }
                          >

                            {
                              deletingId ===
                              user.id
                                ? (
                                  <FaSyncAlt
                                    className="refresh-spinning"
                                  />
                                )
                                : (
                                  <FaTrash />
                                )
                            }

                          </button>


                        </td>

                      </tr>

                    )
                  )

                )}

              </tbody>

            </table>

          </div>


        </div>


        {/* ===================================================
            VIEW USER MODAL
        ==================================================== */}

        <UserModal
          user={
            selectedUser
          }
          onClose={
            closeUserModal
          }
        />


        {/* ===================================================
            ADD USER MODAL
        ==================================================== */}

        <AddUserModal
          isOpen={
            showAddModal
          }

          onClose={
            closeAddModal
          }

          refreshUsers={
            handleAddUserSuccess
          }
        />


      </div>

    </div>

  );

}


export default UserManagement;