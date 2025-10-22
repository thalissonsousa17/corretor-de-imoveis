import axios from "axios";

const api = axios.create({
  baseURL: "/api", // automaticamente usa as rotas do Next.js
});

export default api;
