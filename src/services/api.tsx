import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

const api = axios.create({
  baseURL: Constants.expoConfig?.extra?.apiUrl,
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