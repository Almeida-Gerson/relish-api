const express = require("express");
const router = express.Router();
const photosController = require("./photoController");

router.get("/photos", photosController.getPhotos);
router.get("/photos/:id", photosController.getPhoto);

module.exports = router;
