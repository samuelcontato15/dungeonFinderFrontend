import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json"
  },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem("@DungeonFinder:token");
  const user = await AsyncStorage.getItem("@DungeonFinder:user");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (user) {
    const parsedUser = JSON.parse(user);

    config.headers["X-Usuario-Id"] = parsedUser.id;
  }

  return config;
});

export default api;