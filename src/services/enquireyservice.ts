// services/enquireyservice.ts

import { apiClient } from "./api";

export const fetchAllEnquiries = async () => {
    try {
        const response = await apiClient.get('/enquiries/get-all'); // Adjust path to your route
        return response.data.data; // Accessing the 'data' array from your backend response
    } catch (error) {
        console.error("Error fetching enquiries:", error);
        throw error;
    }
};