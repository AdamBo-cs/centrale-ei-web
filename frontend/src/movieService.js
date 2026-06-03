import api from "./api";

export async function getMovies() {
  const response = await api.get("/movies");
  return response.data;
}