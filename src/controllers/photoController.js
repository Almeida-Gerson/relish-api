const photoService = require("../services/photoService");

// Get paginated photos based on filters sent by the user
const getPhotos = async (req, res, next) => {
  try {
    // Fetch all data
    const users = await photoService.getUsers();
    const albums = await photoService.getAlbums();
    const photos = await photoService.getPhotos();

    // Parse query parameters for filtering and pagination
    const titleFilter = req.query.title || undefined;
    const albumTitleFilter = req.query["album.title"] || undefined;
    const userEmailFilter = req.query["album.user.email"] || undefined;

    // Pagination parameters
    const limit = parseInt(req.query.limit) || 25;
    const offset = parseInt(req.query.offset) || 0;

    // Enrich photos with album and user information
    const enrichedPhotos = photos.map((photo) => {
      const album = albums.find((album) => album.id === photo.albumId);
      const user = users.find((user) => user.id === album.userId);

      return {
        ...photo,
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
        if (userEmailFilter && photo.album.user?.email !== userEmailFilter) {
          return false;
        }

        return true;
      });
    }

    // Apply pagination
    const paginatedPhotos = filteredPhotos.slice(offset, offset + limit);

    res.status(200).json(paginatedPhotos);
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};

// Get photos based on id sent by the user
const getPhoto = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      res.status(200).json(null);
    }

    // Fetch all data
    const photos = await photoService.getPhotos({
      id: req.params.id,
    });
    const albums = await photoService.getAlbums({ id: photos?.[0]?.albumId });

    const users = await photoService.getUsers({
      id: albums?.[0]?.userId,
    });

    // Enrich photo with album and user information
    const enrichedPhoto = {
      ...photos?.[0],
      album: {
        id: albums?.[0]?.id,
        title: albums?.[0]?.title,
        user: users?.[0],
      },
    };

    res.status(200).json(enrichedPhoto);
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};

module.exports = {
  getPhotos,
  getPhoto,
};