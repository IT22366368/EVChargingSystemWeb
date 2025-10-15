import api from "./auth.service";

export const getAllStations = async () => {
  try {
    const response = await api.get("/stations");
    return response.data;
  } catch (error) {
    console.error("Get all stations failed:", error);
    throw error;
  }
};

export const getStationById = async (stationId) => {
  try {
    const response = await api.get(`/stations/${stationId}`);
    return response.data;
  } catch (error) {
    console.error("Get station by ID failed:", error);
    throw error;
  }
};

export const updateStation = async (stationId, stationData) => {
  try {
    // debug outgoing payload
    // eslint-disable-next-line no-console
    console.debug(`[updateStation] id=${stationId} payload:`, stationData);
    const response = await api.put(`/stations/${stationId}`, stationData, {
      headers: { "Content-Type": "application/json" },
    });
    // eslint-disable-next-line no-console
    console.debug(`[updateStation] response:`, response.data);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Update station failed: status=", error.response?.status, "data=", error.response?.data, "error=", error.message);

    // Some backends require the payload wrapped under a `station` key for update as well.
    const msg = error.response?.data?.message || "";
    if (error.response?.status === 400 && /station data is required/i.test(msg)) {
      try {
        // eslint-disable-next-line no-console
        console.debug('[updateStation] retrying with { station: ... } wrapper');
        const retryResp = await api.put(`/stations/${stationId}`, { station: stationData }, {
          headers: { "Content-Type": "application/json" },
        });
        // eslint-disable-next-line no-console
        console.debug('[updateStation] retry response:', retryResp.data);
        return retryResp.data;
      } catch (retryError) {
        // eslint-disable-next-line no-console
        console.error('Update station retry failed:', retryError.response?.status, retryError.response?.data, retryError.message);
        throw retryError;
      }
    }

    throw error;
  }
};

export const toggleStationStatus = async (stationId, isActive) => {
  try {
    // Choose correct endpoint based on desired status
    const path = isActive ? `/stations/activate/${stationId}` : `/stations/deactivate/${stationId}`;
    // eslint-disable-next-line no-console
    console.debug(`[toggleStationStatus] calling ${isActive ? 'activate' : 'deactivate'} for id=${stationId}`);
    const response = await api.put(path, null, {
      headers: { "Content-Type": "application/json" },
    });
    // eslint-disable-next-line no-console
    console.debug('[toggleStationStatus] response:', response.data);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Toggle station status failed: status=', error.response?.status, 'data=', error.response?.data, 'error=', error.message);
    throw error;
  }
};

export const createStation = async (stationData) => {
  try {
    // Debug: log outgoing payload (useful during local dev)
    // eslint-disable-next-line no-console
    console.debug("[createStation] payload:", stationData);
    const response = await api.post(`/stations`, stationData, {
      headers: { "Content-Type": "application/json" },
    });
    // eslint-disable-next-line no-console
    console.debug("[createStation] response:", response.data);
    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Create station failed: status=", error.response?.status, "data=", error.response?.data, "error=", error.message);

    // Some backends expect the station payload to be wrapped under a `station` key.
    // If the server complains that station data is required, try retrying with that wrapper.
    const msg = error.response?.data?.message || "";
    if (error.response?.status === 400 && /station data is required/i.test(msg)) {
      try {
        // eslint-disable-next-line no-console
        console.debug('[createStation] retrying with { station: ... } wrapper');
        const retryResp = await api.post(`/stations`, { station: stationData }, {
          headers: { "Content-Type": "application/json" },
        });
        // eslint-disable-next-line no-console
        console.debug("[createStation] retry response:", retryResp.data);
        return retryResp.data;
      } catch (retryError) {
        // eslint-disable-next-line no-console
        console.error("Create station retry failed:", retryError.response?.status, retryError.response?.data, retryError.message);
        throw retryError;
      }
    }

    throw error;
  }
};
