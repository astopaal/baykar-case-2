import axios from "axios";
import { api } from "./api";

export const fetchInitialSeats = async () => {
    try {
        const response = await api.get("/users");
        return response.data;
    } catch (error) {
        console.error("Error fetching seats", error);
        return [];
    }
};
