import api from "./api";


const sustainabilityService = {


  // Complete Analysis
  analyzeSustainability: async (data) => {

    const response =
      await api.post(
        "/sustainability/complete",
        data
      );

    return response.data;
  },



  // Only Assessment
  assessment: async (data) => {

    const response =
      await api.post(
        "/sustainability/assessment",
        data
      );

    return response.data;
  },



  // Recycling Recommendation
  recommendation: async (data) => {

    const response =
      await api.post(
        "/sustainability/recommendation",
        data
      );

    return response.data;
  },



  // Environmental Impact
  environmentalImpact: async (data) => {

    const response =
      await api.post(
        "/sustainability/environmental-impact",
        data
      );

    return response.data;
  },



  // Circular Analytics
  circularAnalytics: async (data) => {

    const response =
      await api.post(
        "/sustainability/circular-analytics",
        data
      );

    return response.data;
  },



  // Health
  health: async () => {

    const response =
      await api.get(
        "/sustainability/health"
      );

    return response.data;
  },


};


export default sustainabilityService;