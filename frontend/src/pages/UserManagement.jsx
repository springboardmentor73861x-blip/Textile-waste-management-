import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import UserModal from "../components/UserModal";
import AddUserModal from "../components/AddUserModal";

import { useState, useEffect } from "react";
import API from "../services/api";

import {
  FaSearch,
  FaPlus,
  FaEye,
  FaTrash,
} from "react-icons/fa";

import "../css/UserManagement.css";

function UserManagement() {

  const [collapsed, setCollapsed] = useState(false);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] = useState("All");

  const [selectedUser, setSelectedUser] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {

    try {

      setLoading(true);

      const response = await API.get("/admin/users");

      setUsers(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  const deleteUser = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {

      await API.delete(`/admin/users/${id}`);

      alert("User deleted successfully.");

      fetchUsers();

    } catch (error) {

      console.error(error);

      alert("Failed to delete user.");

    }

  };

  const filteredUsers = users.filter((user) => {

    const matchesSearch =
      user.full_name
        .toLowerCase()
        .includes(search.toLowerCase()) ||

      user.email
        .toLowerCase()
        .includes(search.toLowerCase());

    const matchesRole =
      roleFilter === "All" ||
      user.role === roleFilter;

    return matchesSearch && matchesRole;

  });

  return (
    <div className="dashboard">

  <Sidebar
    collapsed={collapsed}
    setCollapsed={setCollapsed}
  />

  <div className={`dashboard-content ${collapsed ? "collapsed" : ""}`}>

    <Navbar />

    <div className="user-management">

      {/* Header */}

      <div className="page-header">

        <div>

          <h1>User Management</h1>

          <p>Manage all registered users.</p>

        </div>

        <button
          className="add-user-btn"
          onClick={() => setShowAddModal(true)}
        >

          <FaPlus />

          Add User

        </button>

      </div>

      {/* Toolbar */}

      <div className="toolbar">

        <div className="search-box">

          <FaSearch className="search-icon" />

          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >

          <option value="All">All Roles</option>

          <option value="Admin">Admin</option>

          <option value="Manufacturer">Manufacturer</option>

          <option value="Recycler">Recycler</option>

          <option value="Supplier">Supplier</option>

        </select>

      </div>

      {/* Table */}

      <div className="table-container">

        <table>

          <thead>

            <tr>

              <th>ID</th>

              <th>Name</th>

              <th>Email</th>

              <th>Role</th>

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

            ) : filteredUsers.length === 0 ? (

              <tr>

                <td
                  colSpan="6"
                  style={{ textAlign: "center" }}
                >
                  No Users Found
                </td>

              </tr>

            ) : (

              filteredUsers.map((user) => (

                <tr key={user.id}>

                  <td>{user.id}</td>

                  <td>{user.full_name}</td>

                  <td>{user.email}</td>

                  <td>{user.role}</td>

                  <td>

                    <span className="status active">

                      Active

                    </span>

                  </td>

                  <td className="actions">

                    <FaEye
                      className="view"
                      title="View"
                      onClick={() => setSelectedUser(user)}
                    />

                    <FaTrash
                      className="delete"
                      title="Delete"
                      onClick={() => deleteUser(user.id)}
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
        {/* View User Modal */}

      <UserModal
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />

      {/* Add User Modal */}

      <AddUserModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        refreshUsers={fetchUsers}
      />

    </div>

  

);

}

export default UserManagement;