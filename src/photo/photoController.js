const NodeCache = require("node-cache");
const photoService = require("./photoService");
const { LIMIT, OFFSET } = require("../constants");
const cache = new NodeCache({ stdTTL: 100, checkperiod: 300 });

// Get paginated photos based on filters sent by the user
const getPhotos = async (req, res, next) => {
  try {
    // Parse query parameters for filtering and pagination
    const {
      title: titleFilter,
      "album.title": albumTitleFilter,
      "album.user.email": userEmailFilter,
    } = req.query || {};

    // Pagination parameters
    const limit = parseInt(req.query.limit) || LIMIT;
    const offset = parseInt(req.query.offset) || OFFSET;

    const cacheKey = `photos__titleFilter${titleFilter ?? ""}_albumTitleFilter${
      albumTitleFilter ?? ""
    }_userEmailFilter${userEmailFilter ?? ""}_limit${limit}_offset${offset}`;

    // Getting a cache value
    const cachedPhotos = cache.get(cacheKey);

    if (cachedPhotos) {
      res.status(200).json(cachedPhotos);
      return;
    }

    // Fetch all data
    const users = await photoService.getUsers();
    const albums = await photoService.getAlbums();
    const photos = await photoService.getPhotos();

    // Enrich photos with album and user information
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

    // Filter based on the provided query parameters
    let filteredPhotos = enrichedPhotos;

    if (titleFilter || albumTitleFilter || userEmailFilter) {
      filteredPhotos = filteredPhotos.filter((photo) => {
        // Filter by photo title
        if (
          titleFilter &&
          !photo.title.toLowerCase().includes(titleFilter?.toLowerCase())
        ) {
          return false;
        }

        // Filter by album title
        if (
          albumTitleFilter &&
          !photo.album.title
            .toLowerCase()
            .includes(albumTitleFilter?.toLowerCase())
        ) {
          return false;
        }

        // Filter by email
        if (
          userEmailFilter &&
          !photo.album.user?.email
            ?.toLowerCase()
            .includes(userEmailFilter?.toLowerCase())
        ) {
          return false;
        }

        return true;
      });
    }

    // Apply pagination
    const paginatedPhotos = filteredPhotos.slice(offset, offset + limit);

    const data = { photos: paginatedPhotos, total: filteredPhotos?.length };
    // Setting cache value
    cache.set(cacheKey, data);

    res.status(200).json(data);
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};

// Get photos based on id sent by the user
const getPhoto = async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!id) {
      // Returns null if an invalid number is received
      res.status(200).json(null);
    }

    const cacheKey = `photo__id${id}`;

    // Getting a cache value
    const cachedPhoto = cache.get(cacheKey);

    if (cachedPhoto) {
      res.status(200).json(cachedPhoto);
      return;
    }

    // Fetch all data
    const photos = await photoService.getPhotos({
      id: req.params.id,
    });
    const [firstPhoto] = photos || [];
    const { albumId: firstPhotoAlbumId } = firstPhoto || {};
    const albums = await photoService.getAlbums({ id: firstPhotoAlbumId });
    const [firstAlbum] = albums || [];
    const { userId, title: albumTitle } = firstAlbum || {};
    const users = await photoService.getUsers({
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
    res.status(200).json(enrichedPhoto);
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};

module.exports = {
  getPhotos,
  getPhoto,
};
