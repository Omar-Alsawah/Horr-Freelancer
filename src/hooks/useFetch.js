import { useState, useEffect, useCallback } from "react";

/**
 * useFetch - A generic hook for making API calls.
 * 
 * @param {Function} apiFunc - The service function to call (e.g., getClientJobs).
 * @param {Boolean} immediate - Whether to fire the request immediately on mount.
 */
export default function useFetch(apiFunc, immediate = true) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFunc();
      setData(result);
    } catch (err) {
      console.error("useFetch Error:", err);
      setError(err.response?.data?.message || err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  useEffect(() => {
    if (immediate) {
      const timeoutId = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
    return undefined;
  }, [immediate, fetchData]);

  return { data, loading, error, setData, refetch: fetchData };
}
