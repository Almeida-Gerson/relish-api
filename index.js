const express = require("express");
const axios = require("axios");

const app = express();

const fetchData = async (endpoint, params) => {
  const response = await axios.get(endpoint, { params });
  return response.data;
};

app.get("/externalapi/photos", async (req, res) => {
  try {
    // Fetch all data
    const users = await fetchData("https://jsonplaceholder.typicode.com/users");
    const albums = await fetchData(
      "https://jsonplaceholder.typicode.com/albums"
    );
    const photos = await fetchData(
      "https://jsonplaceholder.typicode.com/photos"
    );

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

    res.json(paginatedPhotos);
  } catch (error) {
    console.log("🚀 ~ app.get ~ error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.get("/externalapi/photos/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      throw new Error("Id is required");
    }

    // Fetch all data
    const photos = await fetchData(
      "https://jsonplaceholder.typicode.com/photos",
      { id: req.params.id }
    );
    const albums = await fetchData(
      "https://jsonplaceholder.typicode.com/albums",
      { id: photos?.[0]?.albumId }
    );
    const users = await fetchData(
      "https://jsonplaceholder.typicode.com/users",
      {
        id: albums?.[0]?.userId,
      }
    );

    // Enrich photo with album and user information
    const enrichedPhoto = {
      ...photos?.[0],
      album: {
        id: albums?.[0]?.id,
        title: albums?.[0]?.title,
        user: users?.[0],
      },
    };

    res.json(enrichedPhoto);
  } catch (error) {
    console.log("🚀 ~ app.get ~ error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

app.listen(3000, () => {
  console.log(`Server is running on http://localhost:3000`);
});
