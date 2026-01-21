import api from "../core/api";



export async function getStatusPayment(id) {
  try {
    let token = localStorage.getItem("access_token");
    let headers = {};
    if (token) {
      headers = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    }
    const response = await api.get(`/payment/status/${id}`, headers);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      return error.response.data;
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
}

export async function retryPayment(body) {
  try {
    const response = await api.post(`/payment/retry`,body);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      console.error("Error response data:", error.response.data);
      console.error("Error response status:", error.response.status);
      return error.response.data;
    } else if (error.request) {
      console.error("No response received:", error.request);
    } else {
      console.error("Error setting up request:", error.message);
    }
  }
}

