const BACKEND_URLS = {
  local: "http://localhost:8080",
  production: "https://hyoshii-farm-be-569244639422.asia-southeast2.run.app",
};

const getBackendUrl = () =>
  window.location.hostname === "localhost"
    ? BACKEND_URLS.local
    : BACKEND_URLS.production;

export const fetchHistoricalData = async () => {
  try {
    const response = await fetch(`${getBackendUrl()}/api/plc-data/history`);
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const data = await response.json();
    console.log("Data from API:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error fetching historical data:", error);
    return [];
  }
};
