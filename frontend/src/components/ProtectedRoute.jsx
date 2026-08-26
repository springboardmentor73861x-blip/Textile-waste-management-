import { Navigate, Outlet, useLocation } from "react-router-dom";


// ============================================================
// GET STORED USER
// ============================================================

function getStoredUser() {
  try {
    const rawUser = localStorage.getItem("user");

    if (!rawUser) {
      return null;
    }

    return JSON.parse(rawUser);

  } catch (error) {

    console.error(
      "Invalid user data in localStorage:",
      error
    );

    localStorage.removeItem("user");

    return null;
  }
}


// ============================================================
// NORMALIZE ROLE
// ============================================================

function normalizeRole(role) {

  const value = String(role || "")
    .trim()
    .toLowerCase();

  if (
    value === "admin" ||
    value === "administrator"
  ) {
    return "admin";
  }

  if (
    value === "manufacturer" ||
    value === "manufacture"
  ) {
    return "manufacturer";
  }

  if (
    value === "recycler" ||
    value === "recycling"
  ) {
    return "recycler";
  }

  if (
    value === "manager" ||
    value === "sustainability" ||
    value === "sustainability_manager"
  ) {
    return "manager";
  }

  return value;
}


// ============================================================
// DASHBOARD BY ROLE
// ============================================================

function getDashboardByRole(role) {

  const dashboardByRole = {

    admin: "/admin",

    manufacturer: "/manufacturer",

    recycler: "/recycler",

    manager: "/manager",

  };

  return (
    dashboardByRole[role] ||
    "/login"
  );
}


// ============================================================
// PROTECTED ROUTE
// ============================================================

function ProtectedRoute({
  allowedRoles = [],
}) {

  const location = useLocation();

  // ==========================================================
  // GET AUTHENTICATION DATA
  // ==========================================================

  const user =
    getStoredUser();

  const token =
    localStorage.getItem(
      "access_token"
    );

  const storedRole =
    localStorage.getItem(
      "role"
    );


  // ==========================================================
  // GET ROLE
  // ==========================================================

  const rawRole =
    user?.role ||
    storedRole ||
    "";

  const role =
    normalizeRole(rawRole);


  // ==========================================================
  // DEBUG
  // ==========================================================

  console.log(
    "================================"
  );

  console.log(
    "ProtectedRoute Debug"
  );

  console.log(
    "Current Path:",
    location.pathname
  );

  console.log(
    "User:",
    user
  );

  console.log(
    "Token Exists:",
    Boolean(token)
  );

  console.log(
    "User Role:",
    user?.role
  );

  console.log(
    "Stored Role:",
    storedRole
  );

  console.log(
    "Normalized Role:",
    role
  );

  console.log(
    "Allowed Roles:",
    allowedRoles
  );

  console.log(
    "================================"
  );


  // ==========================================================
  // AUTHENTICATION CHECK
  // ==========================================================

  /*
     We require either:

     1. a valid user object
     OR
     2. a stored role + access token

     This prevents the route from unnecessarily
     redirecting to login when the authentication
     data is stored slightly differently.
  */

  const isAuthenticated =
    Boolean(user) ||
    Boolean(token);


  if (!isAuthenticated) {

    console.warn(
      "ProtectedRoute: User is not authenticated."
    );

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }


  // ==========================================================
  // ROLE CHECK
  // ==========================================================

  const normalizedAllowedRoles =
    allowedRoles.map(
      normalizeRole
    );


  // ==========================================================
  // NO ROLE FOUND
  // ==========================================================

  if (!role) {

    console.warn(
      "ProtectedRoute: No user role found."
    );

    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
        }}
      />
    );
  }


  // ==========================================================
  // CHECK PERMISSION
  // ==========================================================

  const hasPermission =
    normalizedAllowedRoles.length === 0 ||
    normalizedAllowedRoles.includes(role);


  // ==========================================================
  // ACCESS DENIED
  // ==========================================================

  if (!hasPermission) {

    console.warn(
      "ProtectedRoute: Access denied",
      {
        role,
        allowedRoles:
          normalizedAllowedRoles,
        path:
          location.pathname,
      }
    );

    return (
      <Navigate
        to={getDashboardByRole(role)}
        replace
      />
    );
  }


  // ==========================================================
  // ACCESS GRANTED
  // ==========================================================

  return <Outlet />;
}


export default ProtectedRoute;