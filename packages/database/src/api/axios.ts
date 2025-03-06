// src/databases/axios.ts
import axios from "axios";

export const createAltanDB = (apiBaseUrl: string) => {
  return axios.create({
    baseURL: apiBaseUrl
  });
};
