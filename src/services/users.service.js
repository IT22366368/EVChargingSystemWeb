import api from "./auth.service";
import store from "../store/store";

export const registerAdmin = async (adminData) => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const user = state.auth.user;

    // Check if user is admin
    if (
      !user?.id ||
      (user.roleId !== 1 && user.role !== 1 && user.Role !== 1)
    ) {
      throw new Error("Only administrators can register new admins.");
    }

    // Use the axios instance with cookies for authentication
    const response = await api.post(`/users/admin/register`, {
      Username: adminData.Username,
      Email: adminData.Email,
      FirstName: adminData.FirstName,
      LastName: adminData.LastName,
      Password: adminData.Password,
    });

    return response.data;
  } catch (error) {
    console.error("Admin registration failed:", error);

    // Handle specific error cases
    if (error.response?.status === 401) {
      throw new Error("Authentication failed. Please log in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. Only administrators can register new admins."
      );
    } else {
      throw new Error(
        error.response?.data?.message || error.message || "Registration failed"
      );
    }
  }
};


// Function to fetch user profile data
export const getUserProfile = async () => {
    try {
        // Making a GET request to fetch the user profile data
        const response = await api.get("/users/profile");
        return response.data; // Returning the profile data from the response
    } catch (error) {
        console.error("Failed to fetch user profile:", error); // Logging the error for debugging

        // Handling specific error responses based on status codes
        if (error.response?.status === 401) {
            // Authentication failure: User needs to log in again
            throw new Error("Authentication failed. Please log in again.");
        } else if (error.response?.status === 403) {
            // Access denied: The user doesn't have the necessary permissions
            throw new Error("Access denied.");
        } else {
            // Default error message: Fallback if no specific error handling matches
            throw new Error(
                error.response?.data?.message || // Check for a message in the response body
                error.message || // If no response message, fall back to the generic error message
                "Failed to fetch profile" // Default error message
            );
        }
    }
};