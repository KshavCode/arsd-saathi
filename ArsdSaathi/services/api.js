// src/services/api.js
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    
    try {
        console.log("Starting Single-Session Login...");
        
        // ONE REQUEST TO RULE THEM ALL
        const response = await axios.post(`${BASE_URL}/api/login`, credentials, { timeout: 60000 });
        
        if (!response.data.success) {
            return { success: false, message: response.data.message };
        }

        const allData = response.data.data;

        // Store Credentials & Token
        await storeData('USER_CREDENTIALS', credentials);
        await storeData('AUTH_TOKEN', response.data.token);

        // Store The Data Chunks
        if (allData.basic_details) await storeData('BASIC_DETAILS', allData.basic_details);
        if (allData.attendance) await storeData('ATTENDANCE_DATA', allData.attendance);
        if (allData.faculty) await storeData('FACULTY_DATA', allData.faculty);
        if (allData.mentor) await storeData('MENTOR_NAME', allData.mentor);

        return { success: true };

    } catch (error) {
        console.error("API Error:", error);
        return { 
            success: false, 
            message: error.response?.data?.detail || error.message || "Network Error" 
        };
    }
};