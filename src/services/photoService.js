const axios = require("axios");

const instance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

const getPhotos = async (params) => {
  const response = await instance.get("/photos", { params });
  return response.data;
};

const getAlbums = async (params) => {
  const response = await instance.get("/albums", { params });
  return response.data;
};

const getUsers = async (params) => {
  const response = await instance.get("/users", { params });
  return response.data;
};

module.exports = { getPhotos, getAlbums, getUsers };
