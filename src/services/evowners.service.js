

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
// Admin creates a new EV owner
export const adminCreateEVOwner = async (data) => {
  try {
    const response = await api.post("/evowners/admin/create", data);
    return response.data;
  } catch (error) {
    console.error("Admin create EV owner failed:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};

// Admin updates an EV owner by NIC
export const adminUpdateEVOwner = async (nic, data) => {
  try {
    const response = await api.put(`/evowners/admin/update/${nic}`, data);
    return response.data;
  } catch (error) {
    console.error("Admin update EV owner failed:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};
// Admin deactivates an EV owner by NIC
export const deactivateEVOwner = async (nic) => {
  try {
    const response = await api.put(`/evowners/admin/deactivate/${nic}`);
    return response.data;
  } catch (error) {
    console.error("Deactivate EV owner failed:", error.response?.data || error.message);
    throw error.response?.data || error.message;
  }
};