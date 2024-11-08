import NodeCache from "node-cache";
import axios from "axios";
import { OFFSET, LIMIT } from "../constants";
import { Album, Photo, PhotoResponse, User } from "../types/photos";

const cache = new NodeCache({ stdTTL: 100, checkperiod: 300 });

const instance = axios.create({
  baseURL: "https://jsonplaceholder.typicode.com",
});

const getPhotosService = async (params?: any): Promise<Photo[]> => {
  const response = await instance.get("/photos", { params });
  return response.data;
};

const getAlbumsService = async (params?: any): Promise<Album[]> => {
  const response = await instance.get("/albums", { params });
  return response.data;
};

const getUsersService = async (params?: any): Promise<User[]> => {
  const response = await instance.get("/users", { params });
  return response.data;
};

// Enrich photos with album and user information
const enrichPhotos = (
  photos: Photo[] = [],
  albums: Album[] = [],
  users: User[] = []
) => {
  const enrichedPhotos = photos.map((photo: Photo) => {
    const album = albums.find((album: Album) => album.id === photo.albumId);
    const user = users.find((user) => user.id === album?.userId);

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
  photos: Photo[] = [],
  filters: { title: string; albumTitle: string; userEmail: string } = {
    title: "",
    albumTitle: "",
    userEmail: "",
  }
): Photo[] => {
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
  photos: Photo[] = [],
  filters: { offset: number; limit: number } = { offset: OFFSET, limit: LIMIT }
): PhotoResponse => {
  const { limit, offset } = filters || {};
  const parsedLimit = Number.isNaN(Number(limit)) ? LIMIT : Number(limit);
  const parsedOffset = Number.isNaN(Number(offset)) ? OFFSET : Number(offset);

  // Apply pagination
  const startIndex = parsedOffset;
  const endIndex = parsedOffset + parsedLimit;
  // Do not include endIndex because array index start in 0
  const paginatedPhotos = photos?.filter(
    (_, index) => index >= startIndex && index < endIndex
  );

  const data = { photos: paginatedPhotos, total: photos?.length };

  return data;
};

// Get paginated photos based on filters sent by the user
export const getPhotos = async (
  filters: {
    title: string;
    "album.title": string;
    "album.user.email": string;
    limit: number;
    offset: number;
  } = {
    title: "",
    "album.title": "",
    "album.user.email": "",
    limit: LIMIT,
    offset: OFFSET,
  }
): Promise<PhotoResponse> => {
  // Parse query parameters for filtering and pagination
  const {
    title,
    "album.title": albumTitle,
    "album.user.email": userEmail,
    limit,
    offset,
  } = filters || {};

  const cacheKey = "enrichedPhotos";

  // Getting a cache value
  const cachedPhotos: Photo[] | undefined = cache.get(cacheKey);

  if (cachedPhotos) {
    // Filter based on the provided query parameters
    const filteredPhotos = filterPhotos(cachedPhotos, {
      title,
      albumTitle,
      userEmail,
    });

    // Apply pagination
    const data = paginatePhotos(filteredPhotos, {
      limit,
      offset,
    });

    return data;
  }

  // Fetch all data
  const requests = [getUsersService(), getAlbumsService(), getPhotosService()];

  const responses = await Promise.all(requests);
  const [users, albums, photos] = responses;

  // Enrich photos with album and user information
  const enrichedPhotos = enrichPhotos(
    photos as Photo[],
    albums as Album[],
    users as User[]
  );

  // Setting cache value
  cache.set(cacheKey, enrichedPhotos);

  // Filter based on the provided query parameters
  const filteredPhotos = filterPhotos(enrichedPhotos as Photo[], {
    title,
    albumTitle,
    userEmail,
  });

  // Apply pagination
  const data = paginatePhotos(filteredPhotos, {
    limit,
    offset,
  });

  return data;
};

// Get photos based on id sent by the user
export const getPhoto = async (photoId: string) => {
  const id = Number(photoId);
  if (!id) {
    // Returns null if an invalid number is received
    return null;
  }

  const cacheKey = `photo__id${id}`;

  // Getting a cache value
  const cachedPhotos: Photo | undefined = cache.get(cacheKey);

  if (cachedPhotos) {
    return cachedPhotos;
  }

  // Fetch all data
  const photos = await getPhotosService({
    id,
  });

  if (!photos?.length) {
    // Pass error to the error handler
    throw new Error("Not photo found");
  }

  const [firstPhoto] = photos || [];
  const { albumId: firstPhotoAlbumId } = firstPhoto || {};
  const albums = await getAlbumsService({
    id: firstPhotoAlbumId,
  });

  if (!albums?.length) {
    // Pass error to the error handler
    throw new Error("Not album found");
  }

  const [firstAlbum] = albums || [];
  const { userId, title: albumTitle } = firstAlbum || {};
  const users = await getUsersService({
    id: userId,
  });

  if (!users?.length) {
    // Pass error to the error handler
    throw new Error("Not user found");
  }

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
};
