import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMe, logout as logoutThunk } from "../authSlice";

/**
 * useAuth - Hook to manage global authentication state using Redux.
 */
export default function useAuth() {
  const dispatch = useDispatch();
  const { user, loading, error, isInitialized } = useSelector((state) => state.auth);
  
  // Instant check: If there is no token in localStorage, we are definitely not authenticated
  const hasToken = !!localStorage.getItem('token');
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated) && hasToken;

  const refreshUser = () => {
    dispatch(fetchMe());
  };

  const logout = () => {
    dispatch(logoutThunk());
  };

  useEffect(() => {
    const controller = new AbortController();
    // Only fetch if we haven't initialized yet and not currently loading
    if (!isInitialized && !loading && !user) {
      dispatch(fetchMe({ signal: controller.signal }));
    }
    return () => controller.abort();
  }, [dispatch, isInitialized, loading, user]);

  return { 
    user, 
    loading, 
    error, 
    isAuthenticated,
    isInitialized,
    role: user?.role || "client", 
    logout,
    refreshUser 
  };
}
