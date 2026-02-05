// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo'; // <--- Import this
import axios from 'axios';

// REPLACE WITH YOUR COMPUTER'S IP
const BASE_URL = 'http://192.168.29.13:8000'; 

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
    
    // --- OPTIMIZATION 1: Instant Internet Check ---
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
        return { success: false, message: "No Internet Connection. Please turn on Wi-Fi or Mobile Data." };
    }

    // --- OPTIMIZATION 2: Fast Server Health Check (Ping) ---
    // We try to reach the server with a SHORT timeout (3s) first.
    // If this fails, we know the server is down/wrong IP immediately.
    try {
        await axios.get(`${BASE_URL}/`, { timeout: 3000 });
    } catch (error) {
        console.error("Server Ping Failed:", error);
        return { success: false, message: "Server is unreachable. Make sure the Python backend is running and the IP is correct." };
    }
    
    // --- STEP 3: The Heavy Request (Only runs if Server is ALIVE) ---
    try {
        console.log("Server is alive. Starting Single-Session Login...");
        
        const response = await axios.post(`${BASE_URL}/api/login`, credentials, { timeout: 60000 });
        
        if (!response.data.success) {
            return { success: false, message: response.data.message };
        }

        const allData = response.data.data;

        // Parallel Saving for slight speed boost
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
        
        let msg = "An unexpected error occurred.";
        
        if (error.code === 'ECONNABORTED') {
            msg = "Request timed out. The college portal is too slow right now.";
        } else if (error.response) {
            // Server responded with a status code outside 2xx
            msg = error.response.data?.detail || "Server Error";
        } else if (error.request) {
            // Request was made but no response received
            msg = "Network Error. Could not connect to backend.";
        }

        return { success: false, message: msg };
    }
};