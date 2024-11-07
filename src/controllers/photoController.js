const {
  getPhotos: getPhotosService,
  getPhoto: getPhotoService,
} = require("../services/photoService");

// Get paginated photos based on filters sent by the user
const getPhotos = async (req, res, next) => {
  try {
    const data = await getPhotosService(req.query || {});
    res.status(200).json(data);
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};

// Get photos based on id sent by the user
const getPhoto = async (req, res, next) => {
  try {
    const data = await getPhotoService(req.params.id);
    res.status(200).json(data);
  } catch (error) {
    next(error); // Pass error to the error handler
  }
};

module.exports = {
  getPhotos,
  getPhoto,
};
