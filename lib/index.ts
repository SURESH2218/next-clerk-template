import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => {
    if (response.data instanceof ReadableStream) {
      return response.data
        .getReader()
        .read()
        .then(({ value }) => {
          const decoder = new TextDecoder();
          const decodedData = decoder.decode(value);
          return JSON.parse(decodedData);
        });
    }
    return response;
  },
  (error) => {
    return Promise.reject(error);
  }
);
