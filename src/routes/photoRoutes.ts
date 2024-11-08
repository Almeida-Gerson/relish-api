import express from "express";
import { getPhotos, getPhoto } from "../controllers/photoController";

const router = express.Router();
router.get("/photos", getPhotos);
router.get("/photos/:id", getPhoto);

export default router;
