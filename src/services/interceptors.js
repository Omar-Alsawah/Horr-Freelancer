import { ENDPOINTS } from "./endpoints";
import { toast } from "sonner";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

const getErrorMessage = (error) => {
  let errorMsg = "";
  let errorCode = "";
  let errorsList = [];
  
  if (error.response?.data) {
    const data = error.response.data;
    const parts = [];
    
    const msg = data.message || data.Message || data.detail || data.Detail || data.title || data.Title;
    if (msg) {
      parts.push(msg);
    }
    
    const errs = data.errors || data.Errors;
    if (errs && Array.isArray(errs) && errs.length > 0) {
      const joinedErrs = errs.join(" ");
      if (msg !== joinedErrs && (!msg || !msg.includes(joinedErrs))) {
        parts.push(joinedErrs);
      }
      errorsList = errs;
    } else if (typeof errs === "object" && errs !== null) {
      const validationErrors = Object.entries(errs)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(", ") : msgs}`)
        .join(" ");
      if (validationErrors) {
        parts.push(validationErrors);
      }
      errorsList = Object.values(errs).flat();
    } else if (typeof data === "string") {
      parts.push(data);
    }
    
    errorMsg = parts.join(" - ");
    errorCode = data.errorCode || data.ErrorCode || error.response.status || "";
  }
  
  if (!errorMsg) {
    errorMsg = error.message || "An unexpected error occurred.";
  }
  
  if (!errorCode) {
    errorCode = error.code || "";
  }
  
  return {
    message: errorMsg,
    errorCode: errorCode,
    succeeded: false,
    errors: errorsList
  };
};

export const setupInterceptors = (axiosInstance) => {
  // REQUEST INTERCEPTOR
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // RESPONSE INTERCEPTOR
  axiosInstance.interceptors.response.use(
    (response) => {
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // If error is 401 and we haven't tried refreshing yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        
        // If we are already refreshing, queue this request
        if (isRefreshing) {
          return new Promise(function (resolve, reject) {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers['Authorization'] = 'Bearer ' + token;
              return axiosInstance(originalRequest);
            })
            .catch((err) => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise(function (resolve, reject) {
          // Call the refresh-token endpoint
          // Note: withCredentials: true ensures the cookie is sent
          axiosInstance
            .post(ENDPOINTS.AUTH.REFRESH_TOKEN)
            .then(({ data }) => {
              // The backend should return the new JWT in the body
              const newToken = data.token || data.jwt || data;
              localStorage.setItem('token', newToken);
              axiosInstance.defaults.headers.common['Authorization'] = 'Bearer ' + newToken;
              originalRequest.headers['Authorization'] = 'Bearer ' + newToken;
              processQueue(null, newToken);
              resolve(axiosInstance(originalRequest));
            })
            .catch((err) => {
              processQueue(err, null);
              localStorage.removeItem('token');
              window.location.href = '/login';
              reject(err);
            })
            .finally(() => {
              isRefreshing = false;
            });
        });
      }

      // Don't toast/globally handle errors from refresh token calls to avoid double-alerts or login redirect issues
      if (originalRequest.url?.includes(ENDPOINTS.AUTH.REFRESH_TOKEN)) {
        return Promise.reject(error);
      }

      // Format error details and show error toast globally
      const normalized = getErrorMessage(error);
      error.message = normalized.message;
      error.errorCode = normalized.errorCode;
      error.errors = normalized.errors;
      error.succeeded = false;

      toast.error(normalized.errorCode ? `${normalized.message} (Code: ${normalized.errorCode})` : normalized.message);

      return Promise.reject(error);
    }
  );
};
