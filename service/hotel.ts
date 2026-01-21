import api from "../core/api";

export async function searchHotel(query: any) {
  try {
    const response = await api.get(`/hotel/search`, {
      params: query,
    });
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

export async function getLocation(query) {
  try {
    const response = await api.get(`/user/locations`, {
      params: query,
    });
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
export async function getSuggest(query) {
  try {
    const response = await api.get(`/hotel/suggest?q=${query}`);
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
export async function getAmenities() {
  try {
    const response = await api.get(`/hotel/amenities`);
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
export async function getAvailableRooms(id, query) {
  try {
    const qs = new URLSearchParams(query).toString();
    const response = await api.get(`/hotel/available_rooms/${id}?${qs}`);
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

export async function getAttribute() {
  try {
    const response = await api.get(`/hotel/room-attributes?type=all`);
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

export async function getDetailHotelApi(id) {
  let token = localStorage.getItem("access_token");
  let headers = {};
  if (token) {
    headers = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }
  try {
    const response = await api.get(`/hotel/detail/${id}`, headers);
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

export async function getReviewHotel(id) {
  try {
    const response = await api.get(`/review/hotel/${id}`);
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
