import { createSlice } from "@reduxjs/toolkit";
import { setCookie, getCookie, deleteCookie } from "../utils/cookieUtils";

// Load initial state from cookies
const getInitialState = () => {
  const savedAuth = getCookie("isAuthenticated");
  const savedUser = getCookie("userData");

  // If an auth flag exists but no user data, clear the stale auth flag to avoid
  // false-positive authenticated state (which causes ProtectedRoute to redirect).
  if (savedAuth && !savedUser) {
    // eslint-disable-next-line no-console
    console.warn("Found isAuthenticated cookie without userData; clearing stale auth.");
    deleteCookie("isAuthenticated");
    return {
      isAuthenticated: false,
      user: null,
      loading: false,
      error: null,
    };
  }

  return {
    isAuthenticated: !!savedAuth,
    user: savedUser || null,
    loading: false,
    error: null,
  };
};

const authSlice = createSlice({
  name: "auth",
  initialState: getInitialState(),
  reducers: {
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.loading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.error = null;

      // Save authentication state to cookies
      setCookie("isAuthenticated", true);
      setCookie("userData", action.payload.user);
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.error = action.payload;

      // Clear cookies on login failure
      deleteCookie("isAuthenticated");
      deleteCookie("userData");
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
      state.error = null;

      // Clear cookies on logout
      deleteCookie("isAuthenticated");
      deleteCookie("userData");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout, clearError } =
  authSlice.actions;
export default authSlice.reducer;
