// this file is made so that we don't have to write complete url while axios requests
// we can just write the endpoint, it will be prefixed with the base url for request

import axios from "axios";

const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "/api"; // this is to provide different base url for production and development

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send cookies with the request
});