import axios from "axios";
import store from "../store/store";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "../store/authSlice";
import { setCookie, getCookie, deleteCookie } from "../utils/cookieUtils";

const API_URL = import.meta.env.VITE_BASE_URL;

// Axios client configured to use proxy and send httpOnly cookies
const api = axios.create({ baseURL: "/api", withCredentials: true });

// If an access token was stored previously (cookie), set the default Authorization header
const existingToken = getCookie("accessToken");
if (existingToken) {
  api.defaults.headers.common["Authorization"] = `Bearer ${existingToken}`;
}

export const login = async (loginData) => {
  // Dispatch login start action
  store.dispatch(loginStart());

  try {
    const { data } = await api.post(`/auth/login`, loginData, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });

    if (data?.user) {
      // Store access token in cookie for dev so we can set Authorization header on reload
      if (data?.accessToken) {
        try {
          setCookie("accessToken", data.accessToken);
          api.defaults.headers.common["Authorization"] = `Bearer ${data.accessToken}`;
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error("Failed to persist access token:", e);
        }
      }

      store.dispatch(
        loginSuccess({
          user: data.user,
        })
      );
    } else {
      store.dispatch(loginFailure(data?.message || "Login failed"));
    }

    return data;
  } catch (error) {
    // Log detailed error info to help debugging (status, body, and full error)
    // eslint-disable-next-line no-console
    console.error("Login error: status=", error.response?.status, "data=", error.response?.data);

    // Extract the actual error message from server response (fallbacks)
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Network error";

    // Dispatch login failure action on error
    store.dispatch(loginFailure(errorMessage));

    // Re-throw the original error so calling code (UI) can handle it if needed
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // Get user data from Redux store
    const state = store.getState();
    const userId = state.auth.user?.id;

    if (userId) {
      // Send logout request to server (cookie-based)
      await api.post(
        `/auth/logout`,
        { userId },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Clear Redux state
    store.dispatch(logout());

    // Remove stored access token and axios header
    try {
      deleteCookie("accessToken");
      delete api.defaults.headers.common["Authorization"];
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error("Error clearing access token:", e);
    }

    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local state even if server request fails
    store.dispatch(logout());
    return { success: false, error: error.message };
  }
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
          const state = store.getState();
          const userId = state?.auth?.user?.id;

          if (!userId) {
            // Nothing to refresh for — force logout
            // eslint-disable-next-line no-console
            console.error("Token refresh skipped: no userId available in store.");
            store.dispatch(logout());
            return Promise.reject(error);
          }

          // Use the configured api instance so proxy/baseURL are applied correctly
          await api.post(
            `/auth/refresh`,
            { userId },
            {
              withCredentials: true,
              headers: { "Content-Type": "application/json" },
            }
          );

          return api(originalRequest); // retry with refreshed cookie
      } catch (refreshError) {
          // refresh failed → log details and force logout
          // eslint-disable-next-line no-console
          console.error("Token refresh failed:", refreshError.response?.status, refreshError.response?.data, refreshError);

          // Dispatch logout action and let UI handle navigation
          store.dispatch(logout());
      }
    }

    return Promise.reject(error);
  }
);

export default api;
