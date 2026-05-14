import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

const api = axios.create({
    baseURL: Constants.expoConfig?.extra?.apiUrl,
    headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(async (config) => {
    const token = await AsyncStorage.getItem("@DungeonFinder:token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;