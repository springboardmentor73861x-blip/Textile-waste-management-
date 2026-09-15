import { useEffect, useState } from "react";
import API from "../api/auth";
import AdminSidebar from "../components/AdminSidebar";
import "../styles/UserManagement.css";

function UserManagement() {

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {

    try {

      const token = localStorage.getItem("token");

      console.log("TOKEN =", token);
      console.log("Base URL =", API.defaults.baseURL);

      const response = await API.get("/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(response.data);

      setUsers(response.data);

    } catch (error) {

      console.log("Status:", error.response?.status);
      console.log("Response:", error.response?.data);
      console.log("Headers:", error.config?.headers);

    }

  };


  // ==========================
  // Change User Role
  // ==========================

  const changeRole = async (userId, currentRole) => {

    const newRole = currentRole === "admin" ? "user" : "admin";

    try {

      const token = localStorage.getItem("token");

      await API.put(
        `/admin/users/${userId}?role=${newRole}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(`Role changed to ${newRole}`);

      fetchUsers();

    } catch (error) {

      console.log(
        "Role update error:",
        error.response?.data
      );

      alert("Failed to update role");

    }

  };


  // ==========================
  // Delete User
  // ==========================

  const deleteUser = async (userId) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {

      const token = localStorage.getItem("token");

      await API.delete(`/admin/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      alert("User deleted successfully");

      fetchUsers();

    } catch (error) {

      console.log(
        "Delete user error:",
        error.response?.data
      );

      alert("Failed to delete user");

    }

  };


  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(search.toLowerCase()) ||
    user.email.toLowerCase().includes(search.toLowerCase())
  );


  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <div className="user-management">

      <h1>User Management</h1>

      <input
        type="text"
        placeholder="Search User..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="search-box"
      />

      <table>

        <thead>

          <tr>
            <th>ID</th>
            <th>Username</th>
            <th>Email</th>
            <th>Role</th>
            <th>Action</th>
          </tr>

        </thead>

        <tbody>

          {filteredUsers.map((user) => (

            <tr key={user.id}>

              <td>{user.id}</td>

              <td>{user.username}</td>

              <td>{user.email}</td>

              <td>

                <span
                  className={
                    user.role === "admin"
                      ? "admin-badge"
                      : "user-badge"
                  }
                >
                  {user.role}
                </span>

              </td>

              <td>

                <button
                  className="edit-btn"
                  onClick={() =>
                    changeRole(user.id, user.role)
                  }
                >
                  {user.role === "admin"
                    ? "Make User"
                    : "Make Admin"}
                </button>

                <button
                  className="delete-btn"
                  onClick={() => deleteUser(user.id)}
                >
                  Delete
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

    </main>
    </div>

  );

}

export default UserManagement;