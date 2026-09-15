import API from "./auth";

export const getSustainabilityDashboard = async () => {
  const response = await API.get("/sustainability/dashboard");
  return response.data;
};

export default API;