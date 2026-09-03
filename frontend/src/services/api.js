import axios from "axios";

// ============================================================
// API INSTANCE
// ============================================================

const API = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  timeout: 60000,
  headers: {
    Accept: "application/json",
  },
});


// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");

    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

API.interceptors.response.use(
  (response) => {
    return response;
  },

  (error) => {
    console.error("API ERROR:", {
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });

    return Promise.reject(error);
  }
);


// ============================================================
// AI TEXTILE PREDICTION
// ============================================================

export const predictTextile = async ({
  file,
  source,
  waste_category,
  color,
  condition,
  weight,
  quantity,
  notes,
}) => {
  const formData = new FormData();

  // ----------------------------------------------------------
  // IMAGE
  // ----------------------------------------------------------

  if (file) {
    formData.append("file", file);
  }

  // ----------------------------------------------------------
  // REQUIRED BACKEND FIELDS
  // ----------------------------------------------------------

  formData.append(
    "source",
    source || ""
  );

  formData.append(
    "waste_category",
    waste_category || ""
  );

  formData.append(
    "condition",
    condition || ""
  );

  // ----------------------------------------------------------
  // OPTIONAL FIELDS
  // ----------------------------------------------------------

  formData.append(
    "color",
    color || ""
  );

  formData.append(
    "weight",
    weight ?? ""
  );

  formData.append(
    "quantity",
    quantity ?? ""
  );

  formData.append(
    "notes",
    notes || ""
  );

  console.log(
    "================================================"
  );

  console.log(
    "AI TEXTILE PREDICTION REQUEST"
  );

  console.log(
    "================================================"
  );

  console.log({
    file: file?.name,
    source,
    waste_category,
    color,
    condition,
    weight,
    quantity,
    notes,
  });

  // ----------------------------------------------------------
  // SEND TO FASTAPI
  // ----------------------------------------------------------

  const response = await API.post(
    "/prediction/predict",
    formData
  );

  console.log(
    "AI TEXTILE PREDICTION RESPONSE:",
    response.data
  );

  return response.data;
};


// ============================================================
// PREDICTION HISTORY
// ============================================================

export const getPredictionHistory = async () => {
  const response = await API.get(
    "/prediction/history"
  );

  return response.data;
};


export const getPredictionHistoryById = async (
  historyId
) => {
  const response = await API.get(
    `/prediction/history/${historyId}`
  );

  return response.data;
};


export const deletePredictionHistory = async (
  historyId
) => {
  const response = await API.delete(
    `/prediction/history/${historyId}`
  );

  return response.data;
};


// ============================================================
// WASTE INVENTORY
// ============================================================

export const getAllWaste = async () => {
  const response = await API.get(
    "/waste/"
  );

  return response.data;
};


export const getWasteById = async (
  wasteId
) => {
  const response = await API.get(
    `/waste/${wasteId}`
  );

  return response.data;
};


export const createWaste = async (
  data
) => {
  const payload = {

    waste_type:
      data.waste_type,

    quantity:
      Number(data.quantity),

    unit:
      data.unit || "Kg",

    location:
      data.location,

    status:
      data.status || "Available",

    source:
      data.source || null,

    waste_category:
      data.waste_category || null,

    color:
      data.color || null,

    condition:
      data.condition || null,

    weight:
      data.weight !== "" &&
      data.weight !== undefined &&
      data.weight !== null
        ? Number(data.weight)
        : null,

    notes:
      data.notes || null,

    material_type:
      data.material_type || null,

    fabric_type:
      data.fabric_type || null,

    class_index:
      data.class_index ?? null,

    confidence:
      data.confidence ?? null,

    composition:
      data.composition || null,

    recyclability:
      data.recyclability || null,

    biodegradability:
      data.biodegradability || null,

    environmental_impact:
      data.environmental_impact || null,

    recommended_processing:
      data.recommended_processing || null,

    recycling_method:
      data.recycling_method || null,

    disposal_method:
      data.disposal_method || null,

    potential_reuse:
      data.potential_reuse || null,

    predicted_color:
      data.predicted_color || null,

    predicted_condition:
      data.predicted_condition || null,
  };

  const response = await API.post(
    "/waste/",
    payload
  );

  return response.data;
};


export const updateWaste = async (
  wasteId,
  data
) => {
  const payload = {

    waste_type:
      data.waste_type,

    quantity:
      Number(data.quantity),

    unit:
      data.unit || "Kg",

    location:
      data.location,

    status:
      data.status,

    source:
      data.source || null,

    waste_category:
      data.waste_category || null,

    color:
      data.color || null,

    condition:
      data.condition || null,

    weight:
      data.weight !== "" &&
      data.weight !== undefined &&
      data.weight !== null
        ? Number(data.weight)
        : null,

    notes:
      data.notes || null,

    material_type:
      data.material_type || null,

    fabric_type:
      data.fabric_type || null,

    class_index:
      data.class_index ?? null,

    confidence:
      data.confidence ?? null,

    composition:
      data.composition || null,

    recyclability:
      data.recyclability || null,

    biodegradability:
      data.biodegradability || null,

    environmental_impact:
      data.environmental_impact || null,

    recommended_processing:
      data.recommended_processing || null,

    recycling_method:
      data.recycling_method || null,

    disposal_method:
      data.disposal_method || null,

    potential_reuse:
      data.potential_reuse || null,

    predicted_color:
      data.predicted_color || null,

    predicted_condition:
      data.predicted_condition || null,
  };

  const response = await API.put(
    `/waste/${wasteId}`,
    payload
  );

  return response.data;
};


export const deleteWaste = async (
  wasteId
) => {
  const response = await API.delete(
    `/waste/${wasteId}`
  );

  return response.data;
};


// ============================================================
// WASTE REQUESTS
// ============================================================

// GET ALL WASTE REQUESTS

export const getAllWasteRequests = async () => {
  const response = await API.get(
    "/waste-requests/"
  );

  return response.data;
};


// GET SINGLE REQUEST

export const getWasteRequestById = async (
  requestId
) => {
  const response = await API.get(
    `/waste-requests/${requestId}`
  );

  return response.data;
};


// CREATE REQUEST

export const createWasteRequest = async (
  data
) => {
  const payload = {

    waste_id:
      data.waste_id ?? null,

    manufacturer:
      data.manufacturer,

    recycler:
      data.recycler,

    material:
      data.material,

    quantity:
      Number(data.quantity),

    unit:
      data.unit || "Kg",

    status:
      data.status || "Pending",

    machine:
      data.machine || null,

    progress:
      data.progress ?? 0,

    notes:
      data.notes || null,
  };

  console.log(
    "CREATING WASTE REQUEST:",
    payload
  );

  const response = await API.post(
    "/waste-requests/",
    payload
  );

  return response.data;
};


// ============================================================
// UPDATE REQUEST STATUS
// ============================================================

export const updateWasteRequestStatus = async (
  requestId,
  status
) => {

  const allowedStatuses = [
    "Pending",
    "Approved",
    "Processing",
    "Completed",
    "Rejected",
  ];

  if (
    !allowedStatuses.includes(status)
  ) {
    throw new Error(
      `Invalid request status: ${status}`
    );
  }

  console.log(
    "UPDATING WASTE REQUEST:",
    {
      requestId,
      status,
    }
  );

  const response = await API.patch(
    `/waste-requests/${requestId}/status`,
    {
      status: status,
    }
  );

  return response.data;
};


// ============================================================
// APPROVE WASTE REQUEST
// ============================================================

export const approveWasteRequest = async (
  requestId
) => {
  return updateWasteRequestStatus(
    requestId,
    "Approved"
  );
};


// ============================================================
// REJECT WASTE REQUEST
// ============================================================

export const rejectWasteRequest = async (
  requestId
) => {
  return updateWasteRequestStatus(
    requestId,
    "Rejected"
  );
};


// ============================================================
// START PROCESSING
// ============================================================

export const startWasteRequestProcessing = async (
  requestId,
  machine = "",
  progress = 0
) => {

  const response = await API.patch(
    `/waste-requests/${requestId}/processing`,
    {
      machine:
        machine || null,

      progress:
        Number(progress),
    }
  );

  return response.data;
};


// ============================================================
// UPDATE PROCESSING
// ============================================================

export const updateWasteRequestProcessing = async (
  requestId,
  machine,
  progress
) => {

  const response = await API.patch(
    `/waste-requests/${requestId}/processing`,
    {
      machine:
        machine || null,

      progress:
        Number(progress),
    }
  );

  return response.data;
};


// ============================================================
// COMPLETE WASTE REQUEST
// ============================================================

export const completeWasteRequest = async (
  requestId,
  machine = ""
) => {

  return updateWasteRequestProcessing(
    requestId,
    machine,
    100
  );
};


// ============================================================
// DELETE WASTE REQUEST
// ============================================================

export const deleteWasteRequest = async (
  requestId
) => {

  const response = await API.delete(
    `/waste-requests/${requestId}`
  );

  return response.data;
};


// ============================================================
// PRODUCTION WASTE
// ============================================================

export const getAllProductionWaste = async () => {

  const response = await API.get(
    "/production-waste/"
  );

  return response.data;
};


export const getProductionWasteById = async (
  wasteId
) => {

  const response = await API.get(
    `/production-waste/${wasteId}`
  );

  return response.data;
};


export const createProductionWaste = async (
  data
) => {

  const payload = {

    production_unit:
      data.production_unit,

    production_process:
      data.production_process ||
      null,

    machine:
      data.machine ||
      null,

    waste_type:
      data.waste_type,

    waste_category:
      data.waste_category ||
      null,

    quantity:
      Number(data.quantity),

    unit:
      data.unit ||
      "Kg",

    weight:
      data.weight !== "" &&
      data.weight !== undefined &&
      data.weight !== null
        ? Number(data.weight)
        : null,

    material_type:
      data.material_type ||
      null,

    fabric_type:
      data.fabric_type ||
      null,

    color:
      data.color ||
      null,

    condition:
      data.condition ||
      null,

    location:
      data.location,

    status:
      data.status ||
      "Pending",

    notes:
      data.notes ||
      null,
  };

  const response = await API.post(
    "/production-waste/",
    payload
  );

  return response.data;
};


export const updateProductionWaste = async (
  wasteId,
  data
) => {

  const payload = {

    production_unit:
      data.production_unit,

    production_process:
      data.production_process ||
      null,

    machine:
      data.machine ||
      null,

    production_process:
      data.production_process ||
      null,

    machine:
      data.machine ||
      null,

    waste_type:
      data.waste_type,

    waste_category:
      data.waste_category ||
      null,

    quantity:
      Number(data.quantity),

    unit:
      data.unit ||
      "Kg",

    weight:
      data.weight !== "" &&
      data.weight !== undefined &&
      data.weight !== null
        ? Number(data.weight)
        : null,

    material_type:
      data.material_type ||
      null,

    fabric_type:
      data.fabric_type ||
      null,

    color:
      data.color ||
      null,

    condition:
      data.condition ||
      null,

    location:
      data.location,

    status:
      data.status,

    notes:
      data.notes ||
      null,
  };

  const response = await API.put(
    `/production-waste/${wasteId}`,
    payload
  );

  return response.data;
};


export const deleteProductionWaste = async (
  wasteId
) => {

  const response = await API.delete(
    `/production-waste/${wasteId}`
  );

  return response.data;
};


// ============================================================
// NOTIFICATIONS
// ============================================================

export const getNotifications = async (
  userId
) => {

  const response = await API.get(
    `/notifications/?user_id=${userId}`
  );

  return response.data;
};


export const markNotificationAsRead = async (
  notificationId
) => {

  const response = await API.put(
    `/notifications/${notificationId}/read`
  );

  return response.data;
};


export const markAllNotificationsAsRead = async (
  userId
) => {

  const response = await API.put(
    `/notifications/read-all?user_id=${userId}`
  );

  return response.data;
};


// ============================================================
// SUSTAINABILITY INTELLIGENCE
// ============================================================


// COMPLETE SUSTAINABILITY ANALYSIS

export const completeSustainabilityAnalysis = async (
  data
) => {

  const response = await API.post(
    "/sustainability/complete",
    data
  );

  return response.data;
};


// SUSTAINABILITY ASSESSMENT

export const sustainabilityAssessment = async (
  data
) => {

  const response = await API.post(
    "/sustainability/assessment",
    data
  );

  return response.data;
};


// RECYCLING RECOMMENDATION

export const recyclingRecommendation = async (
  data
) => {

  const response = await API.post(
    "/sustainability/recommendation",
    data
  );

  return response.data;
};


// ENVIRONMENTAL IMPACT

export const environmentalImpact = async (
  data
) => {

  const response = await API.post(
    "/sustainability/environmental-impact",
    data
  );

  return response.data;
};


// CIRCULAR ANALYTICS

export const circularAnalytics = async (
  data
) => {

  const response = await API.post(
    "/sustainability/circular-analytics",
    data
  );

  return response.data;
};


// SUSTAINABILITY HEALTH

export const sustainabilityHealth = async () => {

  const response = await API.get(
    "/sustainability/health"
  );

  return response.data;
};


// ============================================================
// EXPORT API
// ============================================================

export default API;