import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import axios from 'axios';
import url from '../secret.js';

// DEPLOY TO RENDER (e.g., https://your-app.onrender.com)
const BASE_URL = url;

// MUST MATCH THE PYTHON KEY EXACTLY
const API_KEY = '2TDlOFQjA6bOcDuiLnirsSS5S9ipEWOFf3R4rjruxjxcs6'; 

const storeData = async (key, value) => {
    try {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    } catch (e) { console.error("Saving Error", e); }
};

export const getData = async (key) => {
    try {
        const jsonValue = await AsyncStorage.getItem(key);
        return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) { return null; }
};

export const clearAllData = async () => {
    try { await AsyncStorage.clear(); } catch(e) {}
}

export const loginAndFetchAll = async (name, rollNo, dob) => {
    const credentials = { name, rollNo, dob };
    
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
        return { success: false, message: "No Internet Connection." };
    }

    try {
        // 🟢 Ping the new route we just created
        await axios.get(`${BASE_URL}/`, { timeout: 5000 });
        console.log("Server is awake!");
    } catch (error) {
        console.error("Ping Failed", error);
        return { success: false, message: "Server is waking up. Please try again in 30 seconds." };
    }
    
    try {
        console.log("Starting Login...");
        
        // --- SEND THE SECRET KEY HERE ---
        const response = await axios.post(
            `${BASE_URL}/api/login`, 
            credentials, 
            { 
                timeout: 60000,
                headers: { 
                    'x-api-key': API_KEY  // <--- The Key
                }
            }
        );
        
        if (!response.data.success) {
            return { success: false, message: response.data.message };
        }

        const allData = response.data.data;

        await Promise.all([
            storeData('USER_CREDENTIALS', credentials),
            storeData('AUTH_TOKEN', response.data.token),
            allData.basic_details && storeData('BASIC_DETAILS', allData.basic_details),
            allData.attendance && storeData('ATTENDANCE_DATA', allData.attendance),
            allData.faculty && storeData('FACULTY_DATA', allData.faculty),
            allData.mentor && storeData('MENTOR_NAME', allData.mentor)
        ]);

        return { success: true };

    } catch (error) {
        console.error("API Error:", error);
        
        // Handle Rate Limiting Error specifically
        if (error.response && error.response.status === 429) {
            return { success: false, message: "Too many login attempts. Please wait 1 minute." };
        }
        
        if (error.response && error.response.status === 403) {
            return { success: false, message: "App Security Error: Invalid API Key." };
        }

        let msg = error.response?.data?.detail || error.message || "Network Error";
        if (error.code === 'ECONNABORTED') msg = "Request timed out. Portal is slow.";
        
        return { success: false, message: msg };
    }
};