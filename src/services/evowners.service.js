// import api from "./auth.service"; // same as station service

// // Get all EV owners
// export const getAllEVOwners = async () => {
//   try {
//     const response = await api.get("/evowners/all");
//     return response.data;
//   } catch (error) {
//     console.error("Get all EV owners failed:", error.response?.data || error.message);
//     throw error.response?.data || error.message;
//   }
// };

// // Get EV owner by NIC
// export const getEVOwnerByNIC = async (nic) => {
//   try {
//     const response = await api.get(`/evowners/profile/${nic}`);
//     return response.data;
//   } catch (error) {
//     console.error("Get EV owner by NIC failed:", error.response?.data || error.message);
//     throw error.response?.data || error.message;
//   }
// };

// // Update EV owner
// export const updateEVOwner = async (nic, ownerData) => {
//   try {
//     console.debug(`[updateEVOwner] nic=${nic} payload:`, ownerData);
//     const response = await api.put(`/evowners/update/${nic}`, ownerData, {
//       headers: { "Content-Type": "application/json" },
//     });
//     console.debug(`[updateEVOwner] response:`, response.data);
//     return response.data;
//   } catch (error) {
//     console.error("Update EV owner failed:", error.response?.status, error.response?.data, error.message);
//     throw error;
//   }
// };

// // Delete EV owner
// export const deleteEVOwner = async (nic) => {
//   try {
//     const response = await api.delete(`/evowners/${nic}`);
//     return response.data;
//   } catch (error) {
//     console.error("Delete EV owner failed:", error.response?.status, error.response?.data, error.message);
//     throw error;
//   }
// };

// // Deactivate EV owner
// export const deactivateEVOwner = async (nic) => {
//   try {
//     const response = await api.put(`/evowners/deactivate/${nic}`);
//     return response.data;
//   } catch (error) {
//     console.error("Deactivate EV owner failed:", error.response?.status, error.response?.data, error.message);
//     throw error;
//   }
// };

// // Reactivate EV owner
// export const reactivateEVOwner = async (nic) => {
//   try {
//     const response = await api.put(`/evowners/reactivate/${nic}`);
//     return response.data;
//   } catch (error) {
//     console.error("Reactivate EV owner failed:", error.response?.status, error.response?.data, error.message);
//     throw error;
//   }
// };


import api from "./auth.service";

// Get all EV owners
export const getAllEVOwners = async () => {
  try {
    const response = await api.get("/evowners/all");
    return response.data;
  } catch (error) {
    console.error("Get all EV owners failed:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Get only deactivated EV owners
export const getDeactivatedEVOwners = async () => {
  try {
    const response = await api.get("/evowners/deactivated");
    return response.data;
  } catch (error) {
    console.error("Get deactivated EV owners failed:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Reactivate EV owner (Admin only)
export const reactivateEVOwner = async (nic) => {
  try {
    const response = await api.put(`/evowners/reactivate/${nic}`);
    return response.data;
  } catch (error) {
    console.error("Reactivate EV owner failed:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
// Delete EV owner (Admin only)
export const deleteEVOwner = async (nic) => {
  try {
    const response = await api.delete(`/evowners/delete/${nic}`);
    return response.data;
  } catch (error) {
    console.error("Delete EV owner failed:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
