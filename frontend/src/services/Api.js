import axios from "axios";

const api = axios.create({
    baseURL: "http://127.0.0.1:8000",
    headers: {
        "Content-Type": "application/json",
    },
});

// ==========================================================
// JWT TOKEN
// ==========================================================

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});


// ==========================================================
// SUSTAINABILITY
// ==========================================================

export const getSustainabilitySummary = async () => {

    const response = await api.get(
        "/sustainability/summary"
    );

    return response.data;
};


export const getSustainabilityRecommendations = async () => {

    const response = await api.get(
        "/sustainability/recommendations"
    );

    return response.data;
};


export const getSustainabilityWaste = async (wasteId) => {

    const response = await api.get(
        `/sustainability/waste/${wasteId}`
    );

    return response.data;
};


// ==========================================================
// REPORTS
// ==========================================================

export const getWasteReport = async () => {

    const response = await api.get(
        "/reports/waste"
    );

    return response.data;
};


export const getSustainabilityReport = async () => {

    const response = await api.get(
        "/reports/sustainability"
    );

    return response.data;
};


export const getRecyclingReport = async () => {

    const response = await api.get(
        "/reports/recycling"
    );

    return response.data;
};


export const getEnvironmentalReport = async () => {

    const response = await api.get(
        "/reports/environmental"
    );

    return response.data;
};


// ==========================================================
// DEFAULT API
// ==========================================================

export default api;