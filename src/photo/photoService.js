const NodeCache = require("node-cache");
const axios = require("axios");
const { OFFSET, LIMIT } = require("../constants");

const cache = new NodeCache({ stdTTL: 100, checkperiod: 300 });

const instance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

const getPhotosService = async (params) => {
  const response = await instance.get("/photos", { params });
  return response.data;
};

const getAlbumsService = async (params) => {
  const response = await instance.get("/albums", { params });
  return response.data;
};

const getUsersService = async (params) => {
  const response = await instance.get("/users", { params });
  return response.data;
};

// Enrich photos with album and user information
const enrichPhotos = (photos = [], albums = [], users = []) => {
  const enrichedPhotos = photos.map((photo) => {
    const album = albums.find((album) => album.id === photo.albumId);
    const user = users.find((user) => user.id === album.userId);

    // Remove albumId property
    const { albumId, ...newPhoto } = photo;

    return {
      ...newPhoto,
      album: { id: album?.id, title: album?.title, user },
    };
  });

  return enrichedPhotos;
};

// Filter based on provided parameters
const filterPhotos = (
  photos = [],
  filters = { title: "", albumTitle: "", userEmail: "" }
) => {
  const { title, albumTitle, userEmail } = filters || {};

  if (!title && !albumTitle && !userEmail) {
    return photos;
  }

  const filteredPhotos = photos.filter((photo) => {
    // Filter by photo title
    if (title && !photo.title.toLowerCase().includes(title?.toLowerCase())) {
      return false;
    }

    // Filter by album title
    if (
      albumTitle &&
      !photo.album.title.toLowerCase().includes(albumTitle?.toLowerCase())
    ) {
      return false;
    }

    // Filter by email
    if (
      userEmail &&
      !photo.album.user?.email?.toLowerCase().includes(userEmail?.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return filteredPhotos;
};

const paginatePhotos = (
  photos = [],
  filters = { offset: OFFSET, limit: LIMIT }
) => {
  const { limit, offset } = filters || {};

  // Apply pagination
  const paginatedPhotos = photos?.slice(offset, offset + limit);

  const data = { photos: paginatedPhotos, total: photos?.length };

  return data;
};

// Get paginated photos based on filters sent by the user
const getPhotos = async (
  filters = {
    title: "",
    "album.title": "",
    "album.user.email": "",
    limit: LIMIT,
    offset: OFFSET,
  }
) => {
  try {
    // Parse query parameters for filtering and pagination
    const {
      title,
      "album.title": albumTitle,
      "album.user.email": userEmail,
      limit,
      offset,
    } = filters || {};

    // Pagination parameters
    const parsedLimit = parseInt(limit, 10);
    const parsedOffset = parseInt(offset, 10);

    const cacheKey = "enrichedPhotos";

    // Getting a cache value
    const cachedPhotos = cache.get(cacheKey);

    if (cachedPhotos) {
      // Filter based on the provided query parameters
      const filteredPhotos = filterPhotos(cachedPhotos, {
        title,
        albumTitle,
        userEmail,
      });

      // Apply pagination
      const data = paginatePhotos(filteredPhotos, {
        limit: parsedLimit,
        offset: parsedOffset,
      });

      return data;
    }

    // Fetch all data
    const users = await getUsersService();
    const albums = await getAlbumsService();
    const photos = await getPhotosService();

    // Enrich photos with album and user information
    const enrichedPhotos = enrichPhotos(photos, albums, users);

    // Setting cache value
    cache.set(cacheKey, enrichedPhotos);

    // Filter based on the provided query parameters
    const filteredPhotos = filterPhotos(enrichedPhotos, {
      title,
      albumTitle,
      userEmail,
    });

    // Apply pagination
    const data = paginatePhotos(filteredPhotos, {
      limit: parsedLimit,
      offset: parsedOffset,
    });

    return data;
  } catch (error) {
    throw error; // Pass error to the error handler
  }
};

// Get photos based on id sent by the user
const getPhoto = async (photoId) => {
  try {
    const id = Number(photoId);
    if (!id) {
      // Returns null if an invalid number is received
      return null;
    }

    const cacheKey = `photo__id${id}`;

    // Getting a cache value
    const cachedPhotos = cache.get(cacheKey);

    if (cachedPhotos) {
      return cachedPhotos;
    }

    // Fetch all data
    const photos = await getPhotosService({
      id,
    });
    const [firstPhoto] = photos || [];
    const { albumId: firstPhotoAlbumId } = firstPhoto || {};
    const albums = await getAlbumsService({
      id: firstPhotoAlbumId,
    });
    const [firstAlbum] = albums || [];
    const { userId, title: albumTitle } = firstAlbum || {};
    const users = await getUsersService({
      id: userId,
    });
    const [firstUser] = users || [];

    // Remove albumId property
    const { albumId, ...photo } = firstPhoto || {};

    // Enrich photo with album and user information
    const enrichedPhoto = {
      ...photo,
      album: {
        id: firstPhotoAlbumId,
        title: albumTitle,
        user: firstUser,
      },
    };

    // Setting cache value
    cache.set(cacheKey, enrichedPhoto);
    return enrichedPhoto;
  } catch (error) {
    throw error; // Pass error to the error handler
  }
};

module.exports = { getPhotos, getPhoto };
