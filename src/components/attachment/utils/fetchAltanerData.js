import { optimai } from '../../../utils/axios.js';

// Function to fetch altaner data
export const fetchAltanerData = async (id, setFlowsCallback) => {
  try {
    // Fetch data from the API
    const response = await optimai.get(`/altaner/${id}/flows`);
    const data = response.data || response;
    if (data?.flows && Array.isArray(data.flows)) {
      setFlowsCallback(data.flows);
    } else {
      setFlowsCallback([]);
    }
  } catch (error) {
    console.error('Error fetching altaner data:', error);
    setFlowsCallback([]); // Set empty on error
  }
}; 