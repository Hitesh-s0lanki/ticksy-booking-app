import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.JAVA_SERVER_API_URL,
  headers: {
    "Accept-Encoding": "identity",
    Accept: "application/x-protobuf",
    "content-type": "application/x-protobuf",
  },
  responseEncoding: "binary",
});
